'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addTodo(formData: FormData) {
  const task = formData.get('task')?.toString().trim()
  if (!task) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('todos').insert({ task, user_id: user.id })
  revalidatePath('/todos')
}

export async function toggleTodo(id: number, isComplete: boolean) {
  const supabase = await createClient()
  await supabase.from('todos').update({ is_complete: isComplete }).eq('id', id)
  revalidatePath('/todos')
}

export async function updateTodo(id: number, task: string) {
  const task_trimmed = task.trim()
  if (!task_trimmed) return

  const supabase = await createClient()
  await supabase.from('todos').update({ task: task_trimmed }).eq('id', id)
  revalidatePath('/todos')
}

export async function deleteTodo(id: number) {
  const supabase = await createClient()
  await supabase.from('todos').delete().eq('id', id)
  revalidatePath('/todos')
}
