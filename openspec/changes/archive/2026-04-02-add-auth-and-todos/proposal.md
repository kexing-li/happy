## Why

项目目前只有一个 Next.js 默认首页和一个未使用的 Supabase 客户端。需要构建真实的用户认证流程和核心功能页面，让应用具备完整的"登录 → 使用"链路。

## What Changes

- 将首页改造为 Magic Link 邮箱登录页
- 新增 `/auth/callback` Route Handler，处理 Magic Link 回调并建立 Cookie session
- 新增 `/todos` 页面，服务端读取 todos 列表，客户端支持新增和删除 todo
- 新增 `middleware.ts`，在每个请求上自动刷新 Supabase session
- 引入 `@supabase/ssr`，替代纯浏览器端 client，支持 Server Component 读取 session
- 改造 `lib/supabaseClient.ts`，拆分为 browser client 和 server client 两个工厂

## Capabilities

### New Capabilities

- `magic-link-auth`: 用户通过邮箱收取 Magic Link 完成无密码登录，session 以 Cookie 形式存储，支持 Server Component 读取
- `todo-list`: 已登录用户可查看、新增、编辑、删除、切换完成状态自己的 todos；列表数据在服务端 fetch，所有写操作通过 Server Action 完成；未登录则重定向到首页

### Modified Capabilities

<!-- 暂无已有 spec 需要修改 -->

## Impact

- `lib/supabaseClient.ts`：改造，拆分为 browser/server 两个 client 工厂
- `middleware.ts`：新增，负责 session 自动续期
- `app/page.tsx`：改造为登录页（Client Component）
- `app/auth/callback/route.ts`：新增，Magic Link 回调处理
- `app/todos/page.tsx`：新增，Server Component Todo 列表页
- 依赖：新增 `@supabase/ssr`
- 环境变量：新增 `NEXT_PUBLIC_SITE_URL`
