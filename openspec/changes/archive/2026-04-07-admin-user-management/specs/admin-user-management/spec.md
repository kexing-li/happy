## ADDED Requirements

### Requirement: Admin user list
系统 SHALL 在 `/admin/users` 页面为管理员展示所有注册用户的列表，包含以下信息：邮箱、显示名、注册时间、管理员状态、应用权限列表。

#### Scenario: Admin views user list
- **WHEN** 管理员访问 `/admin/users`
- **THEN** 系统展示所有用户的表格，包含邮箱、显示名、注册时间、管理员标识、应用权限

#### Scenario: Non-admin access denied
- **WHEN** 非管理员用户访问 `/admin/users`
- **THEN** 系统重定向至 `/dashboard` 并显示无权限提示

#### Scenario: Unauthenticated access denied
- **WHEN** 未登录用户访问 `/admin/users`
- **THEN** 系统重定向至登录页

### Requirement: Grant app permission
系统 SHALL 允许管理员为用户授予特定应用的访问权限。

#### Scenario: Admin grants mahjong access
- **WHEN** 管理员在用户列表中为用户 A 勾选「麻将统计」权限
- **THEN** 系统将 `mahjong` 添加到用户 A 的 `app_permissions` 数组
- **THEN** 用户 A 可访问 `/mahjong` 页面

#### Scenario: Permission update feedback
- **WHEN** 权限更新成功
- **THEN** 系统显示成功提示，无需刷新页面

### Requirement: Revoke app permission
系统 SHALL 允许管理员撤销用户的应用访问权限。

#### Scenario: Admin revokes mahjong access
- **WHEN** 管理员在用户列表中为用户 A 取消勾选「麻将统计」权限
- **THEN** 系统将 `mahjong` 从用户 A 的 `app_permissions` 数组移除
- **THEN** 用户 A 访问 `/mahjong` 时被重定向至 Dashboard

### Requirement: Grant admin privilege
系统 SHALL 允许管理员将其他用户提升为管理员。

#### Scenario: Admin promotes user
- **WHEN** 管理员在用户列表中将用户 B 的管理员开关打开
- **THEN** 系统将用户 B 的 `is_admin` 设为 `true`
- **THEN** 用户 B 获得管理员权限，可访问 `/admin/users`

### Requirement: Revoke admin privilege
系统 SHALL 允许管理员撤销其他用户的管理员权限，但不能撤销自己的管理员权限。

#### Scenario: Admin demotes another admin
- **WHEN** 管理员 A 在用户列表中将管理员 B 的管理员开关关闭
- **THEN** 系统将用户 B 的 `is_admin` 设为 `false`

#### Scenario: Admin cannot demote self
- **WHEN** 管理员 A 尝试关闭自己的管理员开关
- **THEN** 系统禁用该操作，开关不可点击，并显示提示「不能撤销自己的管理员权限」

### Requirement: App permission enforcement
系统 SHALL 在用户访问需要权限的应用页面时检查其 `app_permissions`。

#### Scenario: User with permission accesses app
- **WHEN** 用户的 `app_permissions` 包含 `mahjong` 且访问 `/mahjong`
- **THEN** 系统正常展示麻将统计页面

#### Scenario: User without permission accesses app
- **WHEN** 用户的 `app_permissions` 不包含 `mahjong` 且访问 `/mahjong`
- **THEN** 系统重定向至 `/dashboard?error=no_permission`
- **THEN** Dashboard 页面显示「您没有访问该应用的权限」提示

#### Scenario: Admin bypass permission check
- **WHEN** 管理员用户访问任何应用页面
- **THEN** 系统允许访问，无论其 `app_permissions` 是否包含该应用

### Requirement: Dashboard admin entry
系统 SHALL 在 Dashboard 页面为管理员显示「用户管理」入口。

#### Scenario: Admin sees user management link
- **WHEN** 管理员访问 `/dashboard`
- **THEN** 页面显示「用户管理」入口链接

#### Scenario: Non-admin does not see link
- **WHEN** 非管理员用户访问 `/dashboard`
- **THEN** 页面不显示「用户管理」入口

### Requirement: RLS protection
系统 SHALL 通过 Row Level Security 策略保护用户权限数据，确保只有管理员可以修改其他用户的 `is_admin` 和 `app_permissions` 字段。

#### Scenario: Non-admin cannot update permissions via API
- **WHEN** 非管理员用户直接调用 Supabase API 尝试更新其他用户的权限
- **THEN** 系统拒绝该操作，返回权限错误
