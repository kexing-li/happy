## Why

现有的 Magic Link 登录每次都需要切换到邮件客户端点击链接，使用频率高时摩擦感明显。改为传统的邮箱+密码登录，配合忘记密码流程，让用户登录更快捷，体验更符合预期。

## What Changes

- **BREAKING** 移除 Magic Link 登录，`app/page.tsx` 改为邮箱+密码登录表单
- 保留 `app/auth/callback/route.ts`，改为处理邮箱验证链接（注册后验证邮箱用）
- 新增 `/register` 页面：用户填写邮箱+密码完成注册，注册后发送验证邮件
- 新增忘记密码入口：用户填写邮箱，系统发送密码重置邮件
- 新增 `/auth/reset-password` 页面：用户通过邮件链接进入，填写新密码完成重置

## Capabilities

### New Capabilities

- `password-login`: 用户通过邮箱+密码登录，登录失败时显示友好错误提示
- `user-registration`: 用户填写邮箱+密码注册账号，注册后收到验证邮件，点击后激活账号并登录
- `forgot-password`: 用户提交邮箱后收到密码重置邮件，点击链接进入重置页面设置新密码

### Modified Capabilities

<!-- 无已有 spec 的需求变更 -->

## Impact

- `app/page.tsx`：重写为邮箱+密码登录页（Client Component）
- `app/register/page.tsx`：新增注册页（Client Component）
- `app/auth/callback/route.ts`：保留并简化，处理邮箱验证 code
- `app/auth/reset-password/page.tsx`：新增密码重置页（Client Component）
- Supabase Dashboard：Redirect URLs 需添加 `http://localhost:3000/auth/callback` 和 `http://localhost:3000/auth/reset-password`
- 环境变量：`NEXT_PUBLIC_SITE_URL` 继续使用，无新增
