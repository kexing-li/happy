import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function MahjongLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 未登录重定向到登录页
  if (!user) {
    redirect('/');
  }

  // 检查用户权限
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin, app_permissions')
    .eq('id', user.id)
    .single();

  // 详细调试日志
  console.log('=== Mahjong Permission Check ===');
  console.log('User ID:', user.id);
  console.log('Profile:', JSON.stringify(profile, null, 2));
  console.log('Error:', error);
  console.log('is_admin:', profile?.is_admin);
  console.log('app_permissions:', profile?.app_permissions);
  console.log('includes mahjong:', profile?.app_permissions?.includes('mahjong'));

  // 管理员跳过权限检查，非管理员需要有 mahjong 权限
  const hasPermission = profile?.is_admin || profile?.app_permissions?.includes('mahjong');
  console.log('hasPermission:', hasPermission);
  
  if (!hasPermission) {
    redirect('/dashboard?error=no_permission');
  }
  
  return <>{children}</>;
}