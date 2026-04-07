## Purpose

用户通过邮箱+密码登录，登录失败时显示友好错误提示。

## Requirements

### Requirement: 用户可通过邮箱和密码登录

系统 SHALL 在首页（`/`）提供邮箱+密码登录表单，用户提交后调用 Supabase 完成身份验证，成功后跳转至 `/todos`，失败时显示明确错误信息。

#### Scenario: 登录成功

- **WHEN** 用户输入正确的邮箱和密码并提交
- **THEN** 系统 SHALL 调用 `signInWithPassword({ email, password })`
- **AND** session 自动写入 Cookie
- **AND** 页面跳转至 `/todos`

#### Scenario: 邮箱或密码错误

- **WHEN** 用户输入的邮箱不存在或密码错误
- **THEN** 系统 SHALL 显示错误提示（如"邮箱或密码不正确"）
- **AND** 不跳转，用户可重新输入

#### Scenario: 登录请求进行中防止重复提交

- **WHEN** 登录请求正在进行中
- **THEN** 提交按钮 SHALL 处于禁用状态
