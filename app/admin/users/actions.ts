'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AdminUserView, AppPermission } from '@/lib/types/admin';

// 获取当前管理员用户 ID
async function getCurrentAdminId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  
  return profile?.is_admin ? user.id : null;
}

// 获取所有用户列表
export async function getUsers(): Promise<AdminUserView[]> {
  const supabase = await createClient();
  
  // 获取所有 profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, is_admin, app_permissions, created_at')
    .order('created_at', { ascending: false });
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return [];
  }

  // 获取用户邮箱（从 auth.users 表，需要 service role 或通过 profiles 关联）
  // 由于 RLS 限制，我们通过 Supabase Admin API 或在 profiles 表中存储 email
  // 这里假设 profiles 表有 email 字段，或者我们用另一种方式获取
  
  // 方案：通过 auth.users 获取邮箱（需要 admin 权限或存储在 profiles）
  // 简化方案：直接返回 profiles 数据，邮箱通过前端显示 display_name 或 ID
  
  // 获取 auth.users 的邮箱信息
  const { data: authData } = await supabase.auth.admin.listUsers();
  const emailMap = new Map<string, string>();
  
  if (authData?.users) {
    authData.users.forEach(u => {
      emailMap.set(u.id, u.email || '');
    });
  }

  return profiles.map(p => ({
    id: p.id,
    email: emailMap.get(p.id) || '未知邮箱',
    display_name: p.display_name,
    is_admin: p.is_admin || false,
    app_permissions: (p.app_permissions || []) as AppPermission[],
    created_at: p.created_at,
  }));
}

// 更新用户应用权限
export async function updateUserPermissions(
  userId: string,
  permissions: AppPermission[]
): Promise<{ success: boolean; error?: string }> {
  const adminId = await getCurrentAdminId();
  if (!adminId) {
    return { success: false, error: '未授权操作' };
  }

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ app_permissions: permissions })
    .eq('id', userId);

  if (error) {
    console.error('Error updating permissions:', error);
    return { success: false, error: '更新失败' };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

// 更新用户管理员状态
export async function updateUserAdminStatus(
  userId: string,
  isAdmin: boolean
): Promise<{ success: boolean; error?: string }> {
  const adminId = await getCurrentAdminId();
  if (!adminId) {
    return { success: false, error: '未授权操作' };
  }

  // 禁止撤销自己的管理员权限
  if (userId === adminId && !isAdmin) {
    return { success: false, error: '不能撤销自己的管理员权限' };
  }

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('id', userId);

  if (error) {
    console.error('Error updating admin status:', error);
    return { success: false, error: '更新失败' };
  }

  revalidatePath('/admin/users');
  return { success: true };
}
