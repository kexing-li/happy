# 部署到 Vercel 指南

本文档介绍如何将 Next.js + Supabase 项目部署到 Vercel 生产环境。

---

## 前置条件

- 代码已推送到 GitHub 仓库
- 已有 [Vercel 账号](https://vercel.com)（可用 GitHub 登录）
- 已有 Supabase 项目并获取相关密钥

---

## 第一步：导入 GitHub 仓库

1. 登录 [vercel.com](https://vercel.com)
2. 点击右上角 **Add New → Project**
3. 在 **Import Git Repository** 中找到你的仓库，点击 **Import**
4. Framework Preset 会自动识别为 **Next.js**，无需修改
5. **暂时不要点 Deploy**，先完成第二步配置环境变量

---

## 第二步：配置环境变量 ⚠️

Vercel 没有本地的 `.env.local`，必须手动填入。

在导入页面找到 **Environment Variables** 区域，依次添加：

| Key | Value | 说明 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon public key |
| `NEXT_PUBLIC_SITE_URL` | `https://你的域名.vercel.app` | 用于构建邮件回调链接 |

> **如何获取 Supabase 密钥：**
> Supabase Dashboard → 你的项目 → **Project Settings → API**
> - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
> - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> **关于 `NEXT_PUBLIC_SITE_URL`：**
> 首次部署前可以先填写预期域名（如 `https://happy.vercel.app`）。
> 部署后如果 Vercel 分配了不同的域名，需要回来更新这个值并重新部署。

---

## 第三步：点击 Deploy

配置完成后点击 **Deploy**，等待 1~2 分钟构建完成。

部署成功后 Vercel 会分配一个域名，格式为：

```
https://happy-xxxxxxxx.vercel.app
```

记下这个域名，下一步要用。

---

## 第四步：更新 Supabase 回调 URL ⚠️

Supabase 只会向白名单内的 URL 发送验证邮件和重置密码邮件。

打开 [Supabase Dashboard](https://supabase.com/dashboard) → 你的项目 → **Authentication → URL Configuration**：

### Site URL

将默认的 `http://localhost:3000` 改为：

```
https://你的域名.vercel.app
```

### Redirect URLs

点击 **Add URL**，逐一添加以下两条：

```
https://你的域名.vercel.app/auth/callback
https://你的域名.vercel.app/auth/reset-password
```

> 如果本地开发仍需使用，可以同时保留 `http://localhost:3000/auth/callback` 和 `http://localhost:3000/auth/reset-password`

---

## 第五步：更新环境变量并重新部署

如果第二步填的 `NEXT_PUBLIC_SITE_URL` 和实际 Vercel 域名不符：

1. Vercel → 你的项目 → **Settings → Environment Variables**
2. 找到 `NEXT_PUBLIC_SITE_URL`，点击编辑，改为正确的生产域名
3. 回到 **Deployments** 页，点击最新部署右侧的 `...` → **Redeploy**

---

## 验证部署

| 功能 | 验证方式 |
|---|---|
| 注册 | 填写邮箱和密码，点击注册，检查邮件是否收到验证邮件 |
| 验证邮件 | 点击邮件中的链接，应跳转到 `/todos` 页面 |
| 登录 | 用已注册的邮箱和密码登录 |
| 忘记密码 | 点击忘记密码，填写邮箱，检查重置邮件 |
| 重置密码 | 点击邮件链接，应跳转到 `/auth/reset-password` 页面并可以设置新密码 |
| Todo 操作 | 添加、编辑、删除、切换完成状态 |

---

## 常见问题

### 注册/重置邮件的链接点击后报错

检查 Supabase Dashboard 中 **Redirect URLs** 是否已添加生产域名。

### 环境变量改了没有生效

Vercel 上更新环境变量后需要 **Redeploy** 才能生效，仅保存不够。

### 本地开发正常，生产环境登录失败

确认 `NEXT_PUBLIC_SITE_URL` 填写的是生产域名而非 `localhost`。

### 忘记密码邮件中的链接跳转到了 localhost

说明 `NEXT_PUBLIC_SITE_URL` 未正确设置为生产域名，参考第五步修正。
