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
  
  return <>{children}</>;
}
