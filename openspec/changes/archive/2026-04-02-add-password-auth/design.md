## Context

项目是 Next.js 16（App Router）+ Supabase 应用，已有完整的 `@supabase/ssr` 架构（Cookie session、Server Component、proxy.ts）。本次变更只涉及认证入口，todo 功能和服务端架构完全不动。

## Goals / Non-Goals

**Goals:**
- 用邮箱+密码登录替换 Magic Link
- 提供用户自助注册 + 邮箱验证流程
- 提供忘记密码 → 邮件重置 → 设置新密码的完整流程
- 登录失败给出明确错误提示

**Non-Goals:**
- 不做 OAuth 社交登录
- 不改动 todo 功能及服务端架构

## Decisions

### Decision 1：登录使用 `signInWithPassword`，Browser Client

登录操作在客户端（Client Component）调用 `supabase.auth.signInWithPassword({ email, password })`，使用已有的 `lib/supabaseClient.ts`（`createBrowserClient`）。`@supabase/ssr` 会自动将返回的 session 写入 Cookie，服务端可正常读取。

### Decision 2：忘记密码使用 `resetPasswordForEmail`

在登录页提供"忘记密码"入口，点击后展开邮箱输入区域，调用 `supabase.auth.resetPasswordForEmail(email, { redirectTo })`，Supabase 发送重置邮件。

`redirectTo` 指向 `/auth/reset-password`，该页面是新增的 Client Component，通过 `supabase.auth.updateUser({ password })` 完成密码更新。

### Decision 3：`/auth/callback` 路由保留，处理邮箱验证

注册后 Supabase 发送的验证邮件使用 PKCE 流，链接指向 `/auth/callback?code=xxx`。`/auth/callback/route.ts` 保留并简化为只处理 `code`（`exchangeCodeForSession`），验证成功后重定向至 `/todos`，失败重定向至 `/register?error=invalid_link`。

### Decision 4：重置密码页通过 `onAuthStateChange` 检测 session

`/auth/reset-password` 是 Client Component，用户点击邮件链接后浏览器自动处理 hash fragment 建立临时 session，页面通过 `supabase.auth.onAuthStateChange` 监听 `PASSWORD_RECOVERY` 事件，确认 session 有效后才展示新密码输入表单。

### Decision 5：密码强度校验在客户端实现，不依赖第三方库

注册页和密码重置页均展示密码强度指示器，规则：
- 至少 8 个字符
- 包含字母和数字
- 强度分三级：弱（仅满足长度）/ 中（字母+数字）/ 强（字母+数字+特殊字符）

纯前端逻辑，无需额外安装库，用正则判断即可。强度不足时仍允许提交（Supabase 最低要求 6 位），但以视觉提示引导用户选择更强密码。

## Risks / Trade-offs

- **邮箱验证体验** → 用户注册后必须查收邮件点击验证链接才能登录，对即时性有要求的场景可在 Supabase Dashboard 关闭"Confirm email"跳过验证
- **密码重置和注册验证都需要配置 Redirect URL** → Dashboard 需添加 `/auth/callback` 和 `/auth/reset-password`
