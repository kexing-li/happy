import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { addTodo } from './actions'
import TodoItem from './TodoItem'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export default async function TodosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-xl mx-auto px-4 py-12">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              我的任务
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">{user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              退出登录
            </button>
          </form>
        </div>

        {/* 新增表单 */}
        <form action={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            name="task"
            placeholder="添加新任务..."
            required
            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            添加
          </button>
        </form>

        {/* Todo 列表 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 px-4">
          {!todos || todos.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-400">
              暂无任务，添加一个吧～
            </p>
          ) : (
            <ul>
              {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
