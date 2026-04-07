import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUsers } from './actions';
import { UserPermissionEditor } from './components/UserPermissionEditor';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const users = await getUsers();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-2xl hover:scale-110 transition-transform"
                title="返回应用中心"
              >
                👥
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">用户管理</h1>
                <p className="text-sm text-gray-500">管理用户权限和应用访问</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              所有用户 <span className="text-gray-400 font-normal">({users.length})</span>
            </h2>
          </div>

          {users.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              暂无用户数据
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* 用户信息 */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">
                          {u.display_name || '未设置昵称'}
                        </span>
                        {u.is_admin && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                            管理员
                          </span>
                        )}
                        {u.id === user?.id && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            你
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{u.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        注册于 {formatDate(u.created_at)}
                      </p>
                    </div>

                    {/* 权限编辑器 */}
                    <div className="flex-shrink-0">
                      <UserPermissionEditor user={u} currentUserId={user?.id || ''} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 说明 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 使用说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 点击应用标签可授予或撤销用户的访问权限</li>
            <li>• 打开「管理员」开关可将用户提升为管理员</li>
            <li>• 你不能撤销自己的管理员权限</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
