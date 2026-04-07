## Context

当前系统基于 Supabase Auth 实现用户认证，用户数据存储在 `profiles` 表中，包含 `id`、`display_name`、`is_admin` 字段。现有权限模型仅区分「已登录」和「管理员」，缺乏应用级别的访问控制。所有已登录用户都可访问 `/mahjong` 等应用页面。

现有技术栈：
- Next.js 15 (App Router, Server Components, Server Actions)
- Supabase (Auth + PostgreSQL + RLS)
- Tailwind CSS

## Goals / Non-Goals

**Goals:**
- 管理员可查看所有注册用户的完整信息
- 管理员可控制用户对特定应用（如 mahjong）的访问权限
- 管理员可提升/撤销其他用户的管理员权限
- 未授权用户访问应用时得到友好提示并重定向
- 数据安全：通过 RLS 确保普通用户无法修改权限

**Non-Goals:**
- 角色权限系统（如 RBAC）- 本次只做应用级开关
- 用户自助申请权限功能
- 审计日志
- 批量操作

## Decisions

### 1. 权限存储方案

**决定**: 在 `profiles` 表新增 `app_permissions TEXT[]` 字段，使用 PostgreSQL 数组类型存储用户可访问的应用标识符。

**理由**:
- 简单直观，`['mahjong', 'todos']` 格式易于理解和查询
- PostgreSQL 原生数组支持 `@>` 操作符检查包含关系
- 相比 JSONB，数组类型更适合存储简单的权限列表
- 易于扩展，未来新增应用只需添加新的标识符

**替代方案**:
- JSONB 字段：过于灵活，本场景不需要嵌套结构
- 关联表 `user_app_permissions`：当前应用数量少，join 查询反而增加复杂度

### 2. 页面结构

**决定**: 新建 `/admin/users` 路由，使用 Server Component + Client Component 混合模式。

```
app/admin/
├── layout.tsx          # 管理员权限检查布局
└── users/
    ├── page.tsx        # 用户列表（Server Component）
    ├── actions.ts      # Server Actions
    └── components/
        └── UserPermissionEditor.tsx  # 权限编辑器（Client Component）
```

**理由**:
- 用户列表初始加载使用 Server Component，无需客户端 JS
- 权限编辑需要交互，使用 Client Component + Server Action
- `layout.tsx` 统一处理管理员权限检查，避免重复代码

### 3. RLS 策略

**决定**: 为 `profiles` 表添加以下 RLS 策略：

```sql
-- 所有用户可读自己的 profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 管理员可读所有 profiles
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 管理员可更新所有 profiles（除了不能撤销自己的管理员权限）
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
```

**理由**:
- 读写分离，精确控制权限
- 管理员判断使用子查询，确保实时检查

### 4. 应用权限检查方式

**决定**: 在各应用页面的 Server Component 中检查 `app_permissions` 数组是否包含对应应用标识符。

```typescript
// app/mahjong/page.tsx
const { data: profile } = await supabase
  .from('profiles')
  .select('app_permissions')
  .eq('id', user.id)
  .single();

if (!profile?.app_permissions?.includes('mahjong')) {
  redirect('/dashboard?error=no_permission');
}
```

**理由**:
- 与现有认证检查模式一致
- 错误处理集中在页面入口
- 避免 Middleware 过于复杂

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 管理员误操作撤销自己权限 | 前端禁用当前用户的管理员开关，后端也做校验 |
| 数据库迁移期间现有用户无权限 | 迁移脚本默认给现有管理员 `['mahjong']` 权限 |
| 应用标识符拼写错误 | 使用 TypeScript 常量定义所有应用标识符 |
| 权限检查遗漏某些路由 | 在应用根 layout 统一检查，而非每个子页面 |
