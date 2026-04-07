## Purpose

用户填写邮箱+密码注册账号，注册后收到验证邮件，点击后激活账号并登录。

## Requirements

### Requirement: 用户可自助注册账号

系统 SHALL 提供 `/register` 注册页，用户填写邮箱、密码和确认密码后提交，系统创建账号并向邮箱发送验证邮件，用户点击验证链接后账号激活并自动登录跳转至 `/todos`。

#### Scenario: 注册成功，等待验证邮件

- **WHEN** 用户输入有效邮箱、密码，且两次密码一致后提交
- **THEN** 系统 SHALL 调用 `supabase.auth.signUp({ email, password, options: { emailRedirectTo } })`
- **AND** 显示提示"注册成功！请查收邮箱，点击验证链接激活账号"

#### Scenario: 邮箱已被注册

- **WHEN** 用户使用已存在的邮箱注册
- **THEN** 系统 SHALL 显示错误提示"该邮箱已被注册，请直接登录"

#### Scenario: 两次密码不一致

- **WHEN** 用户输入的密码与确认密码不一致
- **THEN** 系统 SHALL 显示提示"两次输入的密码不一致"
- **AND** 不提交注册请求

#### Scenario: 邮箱验证链接回调

- **WHEN** 用户点击验证邮件中的链接，浏览器访问 `/auth/callback?code=xxx`
- **THEN** 系统 SHALL 调用 `exchangeCodeForSession(code)` 完成账号激活
- **AND** 重定向至 `/todos`

#### Scenario: 密码强度实时反馈

- **WHEN** 用户在注册页输入密码
- **THEN** 页面 SHALL 实时显示密码强度指示器（弱 / 中 / 强）
- **AND** 强度判断基于：长度 ≥ 8、包含字母+数字、包含特殊字符

#### Scenario: 注册页提供登录入口

- **WHEN** 用户已有账号，进入注册页
- **THEN** 页面 SHALL 提供返回登录页的链接
