'use client';

import { useState } from 'react';
import type { YearlyStats } from '@/lib/types/mahjong';
import { PLAYER_NAMES } from '@/lib/types/mahjong';

interface YearlyStatsProps {
  data: YearlyStats[];
}

export function YearlyStatsComponent({ data }: YearlyStatsProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📅 年度统计</h2>
        <div className="h-40 flex items-center justify-center text-gray-400">
          暂无数据
        </div>
      </div>
    );
  }

  const years = data.map(d => d.year);
  const currentData = selectedYear === 'all' 
    ? {
        year: 0,
        total_games: data.reduce((sum, d) => sum + d.total_games, 0),
        total_rake: data.reduce((sum, d) => sum + d.total_rake, 0),
        total_table_fee: data.reduce((sum, d) => sum + d.total_table_fee, 0),
        total_meal_cost: data.reduce((sum, d) => sum + d.total_meal_cost, 0),
        total_other_cost: data.reduce((sum, d) => sum + d.total_other_cost, 0),
        zhou_total: data.reduce((sum, d) => sum + d.zhou_total, 0),
        xing_total: data.reduce((sum, d) => sum + d.xing_total, 0),
        fei_total: data.reduce((sum, d) => sum + d.fei_total, 0),
        jun_total: data.reduce((sum, d) => sum + d.jun_total, 0),
        ping_total: data.reduce((sum, d) => sum + d.ping_total, 0),
      }
    : data.find(d => d.year === selectedYear);

  if (!currentData) return null;

  // 计算年度 MVP 和贡献王
  const playerProfits = [
    { name: 'zhou', profit: currentData.zhou_total },
    { name: 'xing', profit: currentData.xing_total },
    { name: 'fei', profit: currentData.fei_total },
    { name: 'jun', profit: currentData.jun_total },
    { name: 'ping', profit: currentData.ping_total },
  ].sort((a, b) => b.profit - a.profit);

  const mvp = playerProfits[0];
  const contributor = playerProfits[playerProfits.length - 1];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">📅 年度统计</h2>
      
      {/* 年份切换 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedYear('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedYear === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {years.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedYear === year
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* MVP 和 贡献王 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">🏆 {selectedYear === 'all' ? '总' : selectedYear + '年度'} MVP</p>
          <p className="text-xl font-bold text-yellow-800">
            {PLAYER_NAMES[mvp.name as keyof typeof PLAYER_NAMES]}
          </p>
          <p className="text-emerald-600 font-medium">
            +{mvp.profit.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">💀 {selectedYear === 'all' ? '总' : selectedYear + '年度'} 贡献王</p>
          <p className="text-xl font-bold text-gray-800">
            {PLAYER_NAMES[contributor.name as keyof typeof PLAYER_NAMES]}
          </p>
          <p className="text-red-600 font-medium">
            {contributor.profit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">场次</p>
          <p className="text-xl font-bold text-gray-900">{currentData.total_games}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">总抽水</p>
          <p className="text-xl font-bold text-gray-900">¥{currentData.total_rake.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">总吃饭</p>
          <p className="text-xl font-bold text-gray-900">¥{currentData.total_meal_cost.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">总台费</p>
          <p className="text-xl font-bold text-gray-900">¥{currentData.total_table_fee.toLocaleString()}</p>
        </div>
      </div>

      {/* 团员盈亏表 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-500">团员</th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">盈亏</th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">场均</th>
            </tr>
          </thead>
          <tbody>
            {playerProfits.map((player, index) => (
              <tr key={player.name} className="border-b border-gray-100">
                <td className="py-2 px-3">
                  <span className="font-medium">
                    {index === 0 && '🥇 '}
                    {index === 1 && '🥈 '}
                    {index === 2 && '🥉 '}
                    {PLAYER_NAMES[player.name as keyof typeof PLAYER_NAMES]}
                  </span>
                </td>
                <td className={`text-right py-2 px-3 font-medium ${
                  player.profit > 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {player.profit > 0 ? '+' : ''}{player.profit.toLocaleString()}
                </td>
                <td className="text-right py-2 px-3 text-gray-500">
                  {currentData.total_games > 0 
                    ? Math.round(player.profit / currentData.total_games)
                    : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
