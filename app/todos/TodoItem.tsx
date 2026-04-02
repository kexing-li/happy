'use client'

import { useState, useRef, useEffect } from 'react'
import { toggleTodo, updateTodo, deleteTodo } from './actions'

interface Todo {
  id: number
  task: string
  is_complete: boolean
}

export default function TodoItem({ todo }: { todo: Todo }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(todo.task)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  const handleSave = async () => {
    await updateTodo(todo.id, editText)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditText(todo.task)
    setEditing(false)
  }

  return (
    <li className="flex items-center gap-3 py-3 border-b border-zinc-100 dark:border-zinc-700 last:border-0 group">
      {/* 完成状态勾选框 */}
      <input
        type="checkbox"
        checked={todo.is_complete}
        onChange={(e) => toggleTodo(todo.id, e.target.checked)}
        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 cursor-pointer flex-shrink-0"
      />

      {/* 任务内容 / 编辑模式 */}
      {editing ? (
        <div className="flex flex-1 items-center gap-2">
          <input
            ref={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-2 py-1 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50"
          />
          <button
            onClick={handleSave}
            className="text-xs px-2 py-1 rounded bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            保存
          </button>
          <button
            onClick={handleCancel}
            className="text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-600 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            取消
          </button>
        </div>
      ) : (
        <>
          <span
            className={`flex-1 text-sm ${
              todo.is_complete
                ? 'line-through text-zinc-400 dark:text-zinc-500'
                : 'text-zinc-800 dark:text-zinc-200'
            }`}
          >
            {todo.task}
          </span>
          {/* 编辑 / 删除按钮（hover 时显示） */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditing(true)}
              className="text-xs px-2 py-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              编辑
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-xs px-2 py-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              删除
            </button>
          </div>
        </>
      )}
    </li>
  )
}
