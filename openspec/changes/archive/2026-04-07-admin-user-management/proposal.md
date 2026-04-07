## Why

目前系统中注册用户默认可以访问所有页面（如 `/mahjong`），缺乏细粒度的访问控制。管理员需要一个界面来查看所有注册用户、管理他们的权限，以及控制哪些用户可以访问特定应用。

## What Changes

- 新增管理员用户管理页面 `/admin/users`，仅管理员可访问
- 显示所有注册用户列表，包含邮箱、显示名、注册时间、管理员状态
- 新增应用访问权限字段，用于控制用户可访问的应用（如麻将统计）
- 支持管理员授权/撤销用户的应用访问权限
- 支持管理员提升/撤销其他用户的管理员权限
- 在 Dashboard 添加管理员入口

## Capabilities

### New Capabilities
- `admin-user-management`: 管理员用户管理能力，包含用户列表展示、权限编辑、访问控制

### Modified Capabilities
<!-- 无需修改现有 spec -->

## Impact

- **数据库**: `profiles` 表需新增 `app_permissions` 字段（JSONB 或 TEXT[] 类型）存储用户可访问的应用列表
- **RLS**: 需要为 `profiles` 表的写操作添加 RLS 策略，确保只有管理员可以修改其他用户的权限
- **路由**: 新增 `/admin/users` 路由，需要管理员权限保护
- **现有页面**: `/mahjong` 等应用页面需增加权限检查，未授权用户重定向至 Dashboard
- **Dashboard**: 需要为管理员添加「用户管理」入口
