## 1. 依赖与环境

- [x] 1.1 安装 `@supabase/ssr` 包（`npm install @supabase/ssr`）
- [x] 1.2 在 `.env.local` 中添加 `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

## 2. Supabase Client 工厂拆分

- [x] 2.1 新建 `lib/supabase/server.ts`，导出基于 `cookies()` 的 `createServerClient` 工厂函数（用于 Server Component 和 Route Handler）
- [x] 2.2 新建 `lib/supabase/middleware.ts`，导出基于 request/response cookies 的 `createServerClient` 工厂函数（用于 Middleware）
- [x] 2.3 改造 `lib/supabaseClient.ts`，改为使用 `createBrowserClient`（用于 Client Component）

## 3. Middleware

- [x] 3.1 新建 `middleware.ts`（项目根目录），调用 `supabase.auth.getUser()` 完成 session 自动续期，并将更新后的 Cookie 写回响应

## 4. 登录页

- [x] 4.1 改造 `app/page.tsx` 为 Magic Link 登录页（Client Component），包含邮箱输入框和发送按钮
- [x] 4.2 实现 `handleLogin`：调用 `signInWithOtp({ email, options: { emailRedirectTo } })`，发送期间禁用按钮，成功/失败显示对应提示

## 5. Auth 回调

- [x] 5.1 新建 `app/auth/callback/route.ts`（Route Handler），从 `searchParams` 读取 `token_hash` 和 `type`
- [x] 5.2 调用 `supabase.exchangeCodeForSession(token_hash)` 换取 session，成功重定向至 `/todos`，失败重定向至 `/?error=invalid_link`

## 6. Todo 页面

- [x] 6.1 新建 `app/todos/page.tsx`（Server Component），使用 `lib/supabase/server.ts` 创建 client
- [x] 6.2 调用 `supabase.auth.getUser()`，若无 session 则 `redirect('/')`
- [x] 6.3 查询 `todos` 表（`select('*').order('created_at', { ascending: false })`），渲染列表或空状态

## 7. Todo 增删（Server Actions）

- [x] 7.1 新建 `app/todos/actions.ts`，实现 `addTodo(formData)` Server Action：校验内容非空，插入 `todos` 表，调用 `revalidatePath('/todos')`
- [x] 7.2 实现 `toggleTodo(id, isComplete)` Server Action：将指定 `id` 的 `is_complete` 更新为传入值，调用 `revalidatePath('/todos')`
- [x] 7.3 实现 `updateTodo(id, task)` Server Action：更新指定 `id` 的 `task` 字段，调用 `revalidatePath('/todos')`
- [x] 7.4 实现 `deleteTodo(id)` Server Action：删除指定 `id` 的记录，调用 `revalidatePath('/todos')`
- [x] 7.5 新建 `app/todos/TodoItem.tsx`（Client Component），包含：勾选框（绑定 `toggleTodo`，已完成时文字加删除线）、内联编辑状态切换（普通展示 ↔ 编辑模式，支持 Escape 取消）、编辑保存（绑定 `updateTodo`）、删除按钮（绑定 `deleteTodo`）
- [x] 7.6 在 `app/todos/page.tsx` 中接入新增表单（绑定 `addTodo` action）、渲染 `<TodoItem>` 列表

## 8. 退出登录

- [x] 8.1 在 `app/todos/page.tsx` 中添加退出登录按钮，绑定 Server Action 调用 `supabase.auth.signOut()` 后 `redirect('/')`
