import type { FunRecord, PlayerName } from '@/lib/types/mahjong';
import { PLAYER_NAMES } from '@/lib/types/mahjong';

interface FunRecordsProps {
  records: FunRecord[];
}

const RECORD_ICONS: Record<string, string> = {
  max_single_win: '🎉',
  max_single_loss: '💀',
  max_win_streak: '🔥',
  max_yearly_meal: '🍜',
};

const RECORD_LABELS: Record<string, string> = {
  max_single_win: '单场最高盈利',
  max_single_loss: '单场最大亏损',
  max_win_streak: '最长连胜',
  max_yearly_meal: '年度吃饭之最',
};

export function FunRecords({ records }: FunRecordsProps) {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🏅 趣味榜单</h2>
        <div className="h-20 flex items-center justify-center text-gray-400">
          暂无数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">🏅 趣味榜单</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {records.map((record, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200 text-center"
          >
            <div className="text-2xl mb-2">{RECORD_ICONS[record.type] || '🏆'}</div>
            <p className="text-xs text-gray-500 mb-1">
              {RECORD_LABELS[record.type] || record.description}
            </p>
            {record.player_name && (
              <p className="font-bold text-gray-900 mb-1">
                {PLAYER_NAMES[record.player_name as PlayerName]}
              </p>
            )}
            <p className={`text-lg font-bold ${
              record.type === 'max_single_win' ? 'text-emerald-600' : 
              record.type === 'max_single_loss' ? 'text-red-600' : 
              'text-gray-900'
            }`}>
              {record.type === 'max_win_streak' 
                ? `${record.value} 连胜`
                : record.type === 'max_yearly_meal'
                ? `¥${record.value.toLocaleString()}`
                : record.type === 'max_single_loss'
                ? `-${record.value.toLocaleString()}`
                : `+${record.value.toLocaleString()}`
              }
            </p>
            {record.date && (
              <p className="text-xs text-gray-400 mt-1">
                {record.year}年 {record.date}
              </p>
            )}
            {record.year && !record.date && (
              <p className="text-xs text-gray-400 mt-1">
                {record.year}年
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
