## Purpose

已登录用户可查看、新增、编辑、删除、切换完成状态自己的 todos；列表数据在服务端 fetch，所有写操作通过 Server Action 完成；未登录则重定向到首页。

## Requirements

### Requirement: 已登录用户可查看自己的 Todo 列表

系统 SHALL 在 `/todos` 页面以 Server Component 方式渲染当前登录用户的 todo 列表，数据在服务端 fetch，首屏直接包含数据，无需客户端二次请求。

#### Scenario: 已登录用户访问 `/todos`

- **WHEN** 已登录用户访问 `/todos`
- **THEN** 系统 SHALL 在服务端读取 Cookie 中的 session，获取当前用户信息
- **AND** 直接从 Supabase `todos` 表查询该用户的所有 todos（按 `created_at` 倒序）
- **AND** 将 todo 列表渲染在页面中，首屏即包含数据

#### Scenario: Todo 列表为空时的展示

- **WHEN** 已登录用户访问 `/todos` 且该用户无任何 todo
- **THEN** 系统 SHALL 显示空状态提示（如"暂无任务"）

### Requirement: 未登录用户访问受保护页面时重定向

系统 SHALL 保护 `/todos` 页面，未登录用户访问时 SHALL 被重定向至首页（登录页）。

#### Scenario: 未登录用户访问 `/todos`

- **WHEN** 未登录用户（无有效 session Cookie）访问 `/todos`
- **THEN** 系统 SHALL 在服务端检测到无 session
- **AND** 立即重定向至 `/`（首页/登录页）
- **AND** 不渲染任何 todo 数据

### Requirement: 用户可新增 Todo

系统 SHALL 允许已登录用户在 `/todos` 页面输入新任务内容并提交，通过 Server Action 将新 todo 插入 Supabase `todos` 表，完成后刷新列表。

#### Scenario: 成功新增 Todo

- **WHEN** 已登录用户输入任务内容并提交新增表单
- **THEN** 系统 SHALL 通过 Server Action 向 `todos` 表插入新记录（`task` 为输入内容，`user_id` 为当前用户）
- **AND** 调用 `revalidatePath('/todos')` 刷新列表
- **AND** 新 todo 出现在列表顶部

#### Scenario: 任务内容为空时不插入

- **WHEN** 用户提交空内容的新增表单
- **THEN** 系统 SHALL 不插入任何记录

### Requirement: 用户可切换 Todo 完成状态

系统 SHALL 允许已登录用户通过点击勾选框切换 todo 的 `is_complete` 状态，通过 Server Action 更新 Supabase `todos` 表，完成后刷新列表。已完成的 todo SHALL 以视觉上可区分的样式展示（如文字添加删除线）。

#### Scenario: 将未完成 Todo 标记为完成

- **WHEN** 已登录用户点击某条未完成 todo 的勾选框
- **THEN** 系统 SHALL 通过 Server Action 将该记录的 `is_complete` 更新为 `true`
- **AND** 调用 `revalidatePath('/todos')` 刷新列表
- **AND** 该 todo 以"已完成"样式展示（文字加删除线）

#### Scenario: 将已完成 Todo 取消完成

- **WHEN** 已登录用户点击某条已完成 todo 的勾选框
- **THEN** 系统 SHALL 通过 Server Action 将该记录的 `is_complete` 更新为 `false`
- **AND** 调用 `revalidatePath('/todos')` 刷新列表
- **AND** 该 todo 恢复为普通样式展示

### Requirement: 用户可编辑 Todo 内容

系统 SHALL 允许已登录用户修改已有 todo 的任务内容，点击编辑后条目切换为内联输入状态，确认后通过 Server Action 更新 Supabase `todos` 表中对应记录，完成后刷新列表。

#### Scenario: 进入编辑状态

- **WHEN** 已登录用户点击某条 todo 的编辑按钮
- **THEN** 该条目 SHALL 切换为内联编辑模式，显示可编辑的 input，内容预填为当前任务文本

#### Scenario: 成功保存编辑

- **WHEN** 用户修改内容后确认提交（点击保存或按 Enter）
- **THEN** 系统 SHALL 通过 Server Action 更新 `todos` 表中该记录的 `task` 字段
- **AND** 调用 `revalidatePath('/todos')` 刷新列表
- **AND** 条目恢复为普通展示状态，显示更新后的内容

#### Scenario: 取消编辑

- **WHEN** 用户在编辑状态下取消（点击取消按钮或按 Escape）
- **THEN** 条目 SHALL 恢复为原始内容，不提交任何更新

#### Scenario: 用户只能编辑自己的 Todo

- **WHEN** Server Action 执行更新操作
- **THEN** Supabase RLS 策略 SHALL 确保只有 `user_id` 匹配当前用户的记录可被更新

### Requirement: 用户可删除 Todo

系统 SHALL 允许已登录用户删除自己的 todo，通过 Server Action 从 Supabase `todos` 表删除对应记录，完成后刷新列表。

#### Scenario: 成功删除 Todo

- **WHEN** 已登录用户点击某条 todo 的删除按钮
- **THEN** 系统 SHALL 通过 Server Action 从 `todos` 表删除该记录（by `id`）
- **AND** 调用 `revalidatePath('/todos')` 刷新列表
- **AND** 该条 todo 从列表中消失

#### Scenario: 用户只能删除自己的 Todo

- **WHEN** Server Action 执行删除操作
- **THEN** Supabase RLS 策略 SHALL 确保只有 `user_id` 匹配当前用户的记录可被删除

### Requirement: 用户可退出登录

系统 SHALL 在 `/todos` 页面提供退出登录按钮，点击后清除 session 并重定向至首页。

#### Scenario: 用户点击退出登录

- **WHEN** 已登录用户点击"退出登录"按钮
- **THEN** 系统 SHALL 调用 `supabase.auth.signOut()` 清除 session Cookie
- **AND** 重定向用户至首页 `/`
