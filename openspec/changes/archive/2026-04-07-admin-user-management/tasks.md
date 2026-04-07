## 1. 数据库变更

- [x] 1.1 在 Supabase 中为 `profiles` 表添加 `app_permissions TEXT[]` 字段，默认值为空数组 `'{}'`
- [x] 1.2 为现有管理员用户设置默认权限 `UPDATE profiles SET app_permissions = ARRAY['mahjong'] WHERE is_admin = true`
- [x] 1.3 创建 RLS 策略：管理员可读取所有 profiles
- [x] 1.4 创建 RLS 策略：管理员可更新所有 profiles

## 2. 类型定义与常量

- [x] 2.1 在 `lib/types/admin.ts` 定义 `AppPermission` 类型和 `AVAILABLE_APPS` 常量
- [x] 2.2 更新 `lib/types/mahjong.ts` 中的 `UserProfile` 接口，添加 `app_permissions` 字段

## 3. 管理员布局与页面

- [x] 3.1 创建 `app/admin/layout.tsx`，实现管理员权限检查，非管理员重定向至 Dashboard
- [x] 3.2 创建 `app/admin/users/page.tsx`，展示用户列表（邮箱、显示名、注册时间、管理员状态、权限）
- [x] 3.3 创建 `app/admin/users/actions.ts`，实现 `getUsers` Server Action 获取所有用户信息

## 4. 权限编辑组件

- [x] 4.1 创建 `app/admin/users/components/UserPermissionEditor.tsx` Client Component
- [x] 4.2 实现应用权限复选框组（麻将统计等）
- [x] 4.3 实现管理员开关，当前用户的开关禁用并显示提示
- [x] 4.4 在 `actions.ts` 中实现 `updateUserPermissions` Server Action
- [x] 4.5 在 `actions.ts` 中实现 `updateUserAdminStatus` Server Action，禁止撤销自己的管理员权限

## 5. 应用权限检查

- [x] 5.1 修改 `app/mahjong/layout.tsx`，添加 `app_permissions` 检查，未授权用户重定向至 Dashboard
- [x] 5.2 管理员用户跳过权限检查，直接访问

## 6. Dashboard 集成

- [x] 6.1 在 `app/dashboard/page.tsx` 管理员快捷操作区添加「用户管理」入口
- [x] 6.2 在 Dashboard 页面处理 `error=no_permission` 查询参数，显示无权限提示

## 7. 测试验证

- [x] 7.1 验证管理员可看到用户列表
- [x] 7.2 验证管理员可授予/撤销用户应用权限
- [x] 7.3 验证管理员可提升/撤销其他用户的管理员权限
- [x] 7.4 验证管理员不能撤销自己的管理员权限
- [x] 7.5 验证普通用户无法访问 `/admin/users`
- [x] 7.6 验证无权限用户无法访问 `/mahjong`
