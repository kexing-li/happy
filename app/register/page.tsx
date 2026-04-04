'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

// 密码强度计算
function getPasswordStrength(password: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (password.length === 0) return { level: 0, label: '', color: '' }
  const hasLength = password.length >= 8
  const hasLetterAndNumber = /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)

  if (hasLength && hasLetterAndNumber && hasSpecial)
    return { level: 3, label: '强', color: 'bg-green-500' }
  if (hasLength && hasLetterAndNumber)
    return { level: 2, label: '中', color: 'bg-yellow-400' }
  if (hasLength)
    return { level: 1, label: '弱', color: 'bg-red-400' }
  return { level: 1, label: '弱', color: 'bg-red-400' }
}

function RegisterContent() {
  const searchParams = useSearchParams()
  const hasLinkError = searchParams.get('error') === 'invalid_link'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  const strength = getPasswordStrength(password)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage({ text: '两次输入的密码不一致', isError: true })
      return
    }

    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      // Supabase 对已存在邮箱的处理：返回 user 但 identities 为空
      setMessage({ text: error.message, isError: true })
    } else if (data.user && data.user.identities?.length === 0) {
      setMessage({ text: '该邮箱已被注册，请直接登录', isError: true })
    } else {
      setMessage({ text: '注册成功！请查收邮箱，点击验证链接激活账号', isError: false })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">创建账号</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">填写邮箱和密码完成注册</p>

        {hasLinkError && (
          <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">验证链接已失效</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">请重新注册或联系管理员</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
          />

          <div className="flex flex-col gap-1.5">
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
            />
            {/* 密码强度指示器 */}
            {password.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                        i <= strength.level ? strength.color : 'bg-zinc-200 dark:bg-zinc-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-zinc-400">{strength.label}</span>
              </div>
            )}
          </div>

          <input
            type="password"
            placeholder="确认密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm text-center ${message.isError ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
            {message.text}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-400">
          已有账号？{' '}
          <Link href="/" className="text-zinc-900 dark:text-zinc-50 font-medium hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  )
}
