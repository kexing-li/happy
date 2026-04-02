## Context

项目是一个 Next.js 16（App Router）+ Supabase 应用。目前只有空白首页和一个浏览器端 Supabase client（`lib/supabaseClient.ts`）。需要构建完整的认证流程和 Todo 功能。

核心约束：Next.js App Router 默认使用 Server Component，服务端无法访问 `localStorage`，因此需要将 session 存储在 Cookie 中，才能在服务端读取登录状态。

## Goals / Non-Goals

**Goals:**
- 实现 Magic Link 邮箱无密码登录
- session 存储在 Cookie，支持 Server Component 直接读取
- `/todos` 页面在服务端完成认证检查和数据 fetch，首屏无闪烁
- 支持通过 Server Action 新增、编辑、删除 todo，操作后刷新列表

**Non-Goals:**
- 不实现 OAuth 社交登录
- 不实现用户注册/邀请流程（Magic Link 即为注册+登录合一）

## Decisions

### Decision 1：使用 `@supabase/ssr` 而非纯 `@supabase/supabase-js`

`@supabase/supabase-js` 默认将 session 存在 `localStorage`，Server Component 无法读取。`@supabase/ssr` 提供 `createServerClient` 和 `createBrowserClient`，统一将 session 存在 Cookie，使 Server Component 和 Middleware 均可读取 session。

**备选方案**：全部用 Client Component + `useEffect` 检查登录。缺点：首屏闪烁，SEO 不友好，不符合 App Router 最佳实践。

### Decision 2：拆分两个 Supabase client 工厂

| 文件 | 用途 | 创建方式 |
|------|------|----------|
| `lib/supabase/server.ts` | Server Component / Route Handler | `createServerClient` + `cookies()` |
| `lib/supabase/middleware.ts` | Middleware | `createServerClient` + request/response cookies |
| `lib/supabaseClient.ts` | Client Component（保留） | `createBrowserClient` |

### Decision 3：Magic Link 回调使用独立 Route Handler

`@supabase/ssr` 方案中，Magic Link 邮件链接使用 query string（`?token_hash=xxx`）而非 hash fragment，因为 hash 不会发送到服务器。需要 `/auth/callback/route.ts` 接收 token，调用 `exchangeCodeForSession` 换取 session 并写入 Cookie，再重定向到 `/todos`。

### Decision 4：Todo 增删使用 Server Action

新增和删除 todo 通过 Next.js Server Action 实现，在服务端直接操作 Supabase，操作完成后调用 `revalidatePath('/todos')` 刷新列表。无需单独的 API Route，也无需客户端管理 loading 状态。

**备选方案**：客户端直接调用 `supabase.from('todos').insert/update/delete`。缺点：需要在 Client Component 里管理状态，且 Browser client 的权限依赖 RLS（RLS 已配置，所以也可行，但 Server Action 更符合 App Router 模式）。

编辑 todo 时，列表条目切换为内联编辑状态（input 替换文本）需要在 Client Component 中管理局部 UI 状态，Server Action 仅负责提交保存。

### Decision 5：Middleware 不做路由保护，只做 session 续期

路由保护（未登录重定向）放在各页面的 Server Component 里做，Middleware 只负责调用 `getUser()` 刷新 token。这样职责清晰，避免 Middleware 需要感知业务路由规则。

## Risks / Trade-offs

- **Cookie 大小限制**（4KB）→ Supabase session token 一般在 1-2KB 以内，风险低
- **`exchangeCodeForSession` 只能用一次** → Magic Link token 单次有效，重复点击邮件链接会报错，需在 callback 页面给出友好提示
- **Supabase Dashboard 需手动配置 Redirect URL** → 本地开发 `http://localhost:3000/auth/callback` 必须加入白名单，否则 Magic Link 无法发送

## Open Questions

- Supabase 项目中 `todos` 表是否已创建？RLS 策略是否已配置？（若无，需在实现前手动在 Dashboard 执行 SQL）