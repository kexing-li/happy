'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

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

type PageState = 'verifying' | 'ready' | 'invalid'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('verifying')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const strength = getPasswordStrength(password)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready')
      } else if (event === 'SIGNED_OUT') {
        setPageState('invalid')
      }
    })

    // 超时处理：3秒内未收到 PASSWORD_RECOVERY 事件则视为无效链接
    const timeout = setTimeout(() => {
      setPageState((prev) => prev === 'verifying' ? 'invalid' : prev)
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/todos')
    }
  }

  if (pageState === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 dark:border-t-zinc-50 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-500">验证中...</p>
        </div>
      </div>
    )
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-8 text-center">
          <p className="text-zinc-900 dark:text-zinc-50 font-medium mb-2">链接已失效</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">请重新申请密码重置</p>
          <Link
            href="/"
            className="text-sm text-zinc-900 dark:text-zinc-50 font-medium hover:underline"
          >
            返回登录页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">设置新密码</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">请输入你的新密码</p>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <input
              type="password"
              placeholder="新密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
            />
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
            placeholder="确认新密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '保存中...' : '保存新密码'}
          </button>
        </form>
      </div>
    </div>
  )
}
