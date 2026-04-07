import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { 
  getOverview, 
  getPlayerStats, 
  getYearlyStats, 
  getTrendData,
  getFunRecords,
  getCurrentUser 
} from './actions';
import { SummaryCards } from './components/SummaryCards';
import { PlayerRanking } from './components/PlayerRanking';
import { TrendChart } from './components/TrendChart';
import { YearlyStatsComponent } from './components/YearlyStats';
import { FunRecords } from './components/FunRecords';
import { RecordTable } from './components/RecordTable';

export default async function MahjongPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/');
  }
  
  // 并行获取所有数据
  const [overview, playerStats, yearlyStats, trendData, funRecords, currentUser] = await Promise.all([
    getOverview(),
    getPlayerStats(),
    getYearlyStats(),
    getTrendData(),
    getFunRecords(),
    getCurrentUser(),
  ]);

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="text-3xl hover:scale-110 transition-transform"
                title="返回应用中心"
              >
                🀄
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
                    麻将团费统计
                  </Link>
                </h1>
                <p className="text-sm text-gray-500">
                  欢迎，{currentUser?.display_name || user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {currentUser?.is_admin && (
                <Link
                  href="/mahjong/upload"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  上传数据
                </Link>
              )}
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  退出登录
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* 总览卡片 */}
        <section>
          <SummaryCards overview={overview} />
        </section>

        {/* 团员排行榜 */}
        <section>
          <PlayerRanking players={playerStats} />
        </section>

        {/* 盈亏趋势图 */}
        <section>
          <TrendChart data={trendData} />
        </section>

        {/* 年度统计 + 趣味榜单 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <YearlyStatsComponent data={yearlyStats} />
          </section>
          <section>
            <FunRecords records={funRecords} />
          </section>
        </div>

        {/* 详细记录 */}
        <section>
          <RecordTable />
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          <p>🀄 Happy Mahjong Team © 2023-{new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
