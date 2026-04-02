## ADDED Requirements

### Requirement: 用户可通过邮箱发送 Magic Link 登录

系统 SHALL 允许用户在登录页输入邮箱地址，系统向该邮箱发送一封含有一次性登录链接（Magic Link）的邮件，用户点击链接后自动完成登录，无需输入密码。

#### Scenario: 成功发送 Magic Link

- **WHEN** 用户在登录页输入有效邮箱并提交表单
- **THEN** 系统调用 Supabase `signInWithOtp`，向该邮箱发送 Magic Link
- **AND** 页面显示"请查收邮箱，点击登录链接"的提示信息

#### Scenario: 邮箱格式无效时不发送

- **WHEN** 用户提交的邮箱格式不合法（如缺少 `@`）
- **THEN** 系统 SHALL 阻止表单提交，不调用 Supabase
- **AND** 浏览器原生校验提示用户输入有效邮箱

#### Scenario: 发送过程中禁用重复提交

- **WHEN** Magic Link 发送请求正在进行中
- **THEN** 提交按钮 SHALL 处于禁用状态，防止重复发送

### Requirement: Magic Link 回调建立登录 session

系统 SHALL 提供 `/auth/callback` Route Handler，接收 Magic Link 邮件中的 `token_hash` 参数，与 Supabase 交换为有效 session，并将 session 写入 Cookie。

#### Scenario: 有效 token 完成登录

- **WHEN** 用户点击邮件中的 Magic Link，浏览器访问 `/auth/callback?token_hash=xxx&type=magiclink`
- **THEN** 系统 SHALL 调用 `exchangeCodeForSession(token_hash)` 换取 session
- **AND** 将 session 写入 Cookie
- **AND** 重定向用户至 `/todos`

#### Scenario: 无效或已过期的 token

- **WHEN** `token_hash` 无效或已使用过
- **THEN** 系统 SHALL 重定向用户至 `/login?error=invalid_link`
- **AND** 登录页 SHALL 显示错误提示

### Requirement: Middleware 自动续期 session

系统 SHALL 在每个请求的 Middleware 中调用 `getUser()`，使 Supabase 自动刷新即将过期的 session token，并将更新后的 Cookie 写回响应。

#### Scenario: 正常请求时 session 自动续期

- **WHEN** 用户发出任意请求且 session token 接近过期
- **THEN** Middleware SHALL 自动刷新 token
- **AND** 响应头中 SHALL 包含更新后的 session Cookie
