## 1. 改造 auth/callback（保留用于邮箱验证）

- [x] 1.1 简化 `app/auth/callback/route.ts`，只保留 `code` 参数处理（`exchangeCodeForSession`），验证成功跳转 `/todos`，失败跳转 `/register?error=invalid_link`；删除 `token_hash` 相关逻辑

## 2. 注册页

- [x] 2.1 新建 `app/register/page.tsx`（Client Component），包含邮箱、密码、确认密码输入框及提交按钮，底部提供"已有账号？去登录"链接
- [x] 2.2 实现密码强度指示器（纯逻辑，无需安装库）：密码输入时实时计算强度（弱/中/强），用彩色进度条展示，规则：长度≥8为弱，再含字母+数字为中，再含特殊字符为强
- [x] 2.3 实现注册逻辑：校验两次密码一致，调用 `supabase.auth.signUp({ email, password, options: { emailRedirectTo: SITE_URL + '/auth/callback' } })`，成功显示"请查收验证邮件"提示，邮箱已存在显示"该邮箱已被注册，请直接登录"

## 3. 登录页重写

- [x] 3.1 重写 `app/page.tsx` 为邮箱+密码登录表单（Client Component），包含邮箱输入框、密码输入框、登录按钮，底部提供"还没有账号？去注册"链接
- [x] 3.2 实现 `handleLogin`：调用 `supabase.auth.signInWithPassword({ email, password })`，成功后 `router.push('/todos')`，失败显示"邮箱或密码不正确"，加载中禁用按钮
- [x] 3.3 在登录页添加"忘记密码？"入口，点击后切换显示忘记密码表单（同一页面内展开，无需跳转）
- [x] 3.4 实现忘记密码表单：输入邮箱，调用 `supabase.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL + '/auth/reset-password' })`，发送成功显示提示，加载中禁用按钮

## 4. 密码重置页

- [x] 4.1 新建 `app/auth/reset-password/page.tsx`（Client Component），通过 `onAuthStateChange` 监听 `PASSWORD_RECOVERY` 事件，事件触发前显示"验证中..."，事件触发后显示新密码表单，无效链接显示失效提示及返回登录页链接
- [x] 4.2 实现密码重置表单：新密码（含强度指示器）+ 确认密码输入框，校验两次输入一致，调用 `supabase.auth.updateUser({ password })`，成功后 `router.push('/todos')`

## 5. Supabase Dashboard 配置

- [x] 5.1 在 Supabase Dashboard → Authentication → URL Configuration → Redirect URLs 中添加 `http://localhost:3000/auth/callback`（邮箱验证回调）
- [x] 5.2 添加 `http://localhost:3000/auth/reset-password`（密码重置回调）
