import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/');
  }

  // 获取用户信息
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, is_admin')
    .eq('id', user.id)
    .single();

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
  };

  const apps = [
    {
      name: '麻将统计',
      description: '团费统计、盈亏分析、趋势图表',
      href: '/mahjong',
      icon: '🀄',
      color: 'from-emerald-500 to-teal-600',
      badge: '新',
    },
    {
      name: 'Todo',
      description: '待办事项管理',
      href: '/todos',
      icon: '✅',
      color: 'from-blue-500 to-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">🏠 应用中心</h1>
              <p className="text-sm text-gray-500">
                欢迎，{profile?.display_name || user.email}
                {profile?.is_admin && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                    管理员
                  </span>
                )}
              </p>
            </div>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                退出登录
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">选择应用</h2>
          <p className="text-gray-500">点击进入你想使用的功能</p>
        </div>

        {/* 应用卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {apps.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
            >
              {/* 背景装饰 */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${app.color} opacity-5 rounded-bl-full`} />
              
              {/* 徽章 */}
              {app.badge && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {app.badge}
                </span>
              )}

              {/* 图标 */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} text-white text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {app.icon}
              </div>

              {/* 内容 */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700">
                {app.name}
              </h3>
              <p className="text-gray-500 text-sm">
                {app.description}
              </p>

              {/* 箭头 */}
              <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* 快捷操作 */}
        {profile?.is_admin && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400 mb-4">管理员快捷操作</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/mahjong/upload"
                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
              >
                📤 上传麻将数据
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="mt-auto py-8 text-center text-sm text-gray-400">
        <p>Happy Apps © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
