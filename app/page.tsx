'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type View = 'login' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('login')

  // 登录状态
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // 忘记密码状态
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState<{ text: string; isError: boolean } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoginError('邮箱或密码不正确')
      setLoginLoading(false)
    } else {
      router.push('/todos')
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    setForgotMessage(
      error
        ? { text: error.message, isError: true }
        : { text: '重置邮件已发送，请查收邮箱', isError: false }
    )
    setForgotLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-8">

        {view === 'login' ? (
          <>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">登录</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">欢迎回来</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
              />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
              />

              {loginError && (
                <p className="text-sm text-red-500 text-center">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loginLoading ? '登录中...' : '登录'}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                onClick={() => setView('forgot')}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                忘记密码？
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-zinc-400">
              还没有账号？{' '}
              <Link href="/register" className="text-zinc-900 dark:text-zinc-50 font-medium hover:underline">
                去注册
              </Link>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={() => { setView('login'); setForgotMessage(null) }}
              className="mb-4 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-1"
            >
              ← 返回登录
            </button>

            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">重置密码</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">输入注册邮箱，我们会发送重置链接</p>

            <form onSubmit={handleForgot} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="邮箱"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
              />
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {forgotLoading ? '发送中...' : '发送重置邮件'}
              </button>
            </form>

            {forgotMessage && (
              <p className={`mt-4 text-sm text-center ${forgotMessage.isError ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {forgotMessage.text}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}