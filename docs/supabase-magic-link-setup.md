# Supabase Magic Link 回调 URL 配置指南

## 第一步：进入项目设置

```
supabase.com
└── 登录后选择你的项目
    └── 左侧导航栏
        └── Authentication（盾牌图标）
            └── URL Configuration（或 Redirect URLs）
```

直接访问：
```
https://supabase.com/dashboard/project/<你的项目ID>/auth/url-configuration
```

---

## 第二步：配置 Site URL

填入本地开发地址：

```
http://localhost:3000
```

上线后改为生产域名。

---

## 第三步：配置 Redirect URLs（允许列表）

点击 **Add URL**，填入：

```
http://localhost:3000/auth/callback
```

保存。

---

## 第四步：代码里发送 Magic Link 时指定 redirectTo

> ⚠️ 光在 Dashboard 加白名单不够，代码里也要明确指定回调地址，两边必须完全一致。

```ts
await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  }
})
```

`.env.local` 里配置：

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 生产环境

在 Dashboard 的 Redirect URLs 允许列表里再加一条：

```
https://your-domain.com/auth/callback
```

Vercel 部署时将 `NEXT_PUBLIC_SITE_URL` 环境变量设置为生产域名。

---

## 完整链路

```
用户填邮箱 → signInWithOtp({ emailRedirectTo: '.../auth/callback' })
                    │
                    ▼
         Supabase 检查 emailRedirectTo
         是否在 Dashboard 白名单里？
                    │
          ┌─────────┴──────────┐
         ✅ 在                ❌ 不在
          │                    │
          ▼                    ▼
     发送邮件             报错，不发邮件
  链接指向 /auth/callback
          │
          ▼
    用户点击邮件链接
          │
          ▼
    GET /auth/callback?token_hash=xxx&type=magiclink
          │
          ▼
    Route Handler 处理 → redirect('/todos')
```
