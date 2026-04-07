## Purpose

用户提交邮箱后收到密码重置邮件，点击链接进入重置页面设置新密码。

## Requirements

### Requirement: 用户可申请密码重置邮件

系统 SHALL 在登录页提供"忘记密码"入口，用户输入邮箱后，系统向该邮箱发送包含重置链接的邮件，链接指向 `/auth/reset-password`。

#### Scenario: 成功发送重置邮件

- **WHEN** 用户点击"忘记密码"并输入已注册的邮箱后提交
- **THEN** 系统 SHALL 调用 `resetPasswordForEmail(email, { redirectTo })`
- **AND** 页面显示"重置邮件已发送，请查收邮箱"的提示

#### Scenario: 发送过程中禁用重复提交

- **WHEN** 重置邮件发送请求正在进行中
- **THEN** 提交按钮 SHALL 处于禁用状态

### Requirement: 用户可通过邮件链接设置新密码

系统 SHALL 提供 `/auth/reset-password` 页面，用户点击重置邮件中的链接后进入该页面，输入新密码并确认，提交后密码更新成功，自动跳转至 `/todos`。

#### Scenario: 有效链接进入重置页

- **WHEN** 用户点击重置邮件中的链接，浏览器进入 `/auth/reset-password`
- **THEN** 系统 SHALL 检测到 `PASSWORD_RECOVERY` session 事件
- **AND** 显示新密码输入表单

#### Scenario: 成功重置密码

- **WHEN** 用户在重置页输入新密码并确认密码一致后提交
- **THEN** 系统 SHALL 调用 `supabase.auth.updateUser({ password })`
- **AND** 密码更新成功后跳转至 `/todos`

#### Scenario: 两次密码输入不一致

- **WHEN** 用户输入的新密码与确认密码不一致
- **THEN** 系统 SHALL 显示提示"两次输入的密码不一致"
- **AND** 不提交更新请求

#### Scenario: 无效或过期链接进入重置页

- **WHEN** 用户通过已过期或无效的链接进入 `/auth/reset-password`
- **THEN** 系统 SHALL 显示提示"链接已失效，请重新申请密码重置"
- **AND** 提供返回登录页的链接
