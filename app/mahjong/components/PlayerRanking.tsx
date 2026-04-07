import type { PlayerStats, PlayerName } from '@/lib/types/mahjong';
import { PLAYER_NAMES } from '@/lib/types/mahjong';

interface PlayerRankingProps {
  players: PlayerStats[];
}

// 根据排名和盈亏返回 emoji
function getEmoji(rank: number, profit: number): string {
  if (rank === 1) return '👑';
  if (profit > 0) return '😊';
  if (profit > -5000) return '😐';
  if (profit > -10000) return '😢';
  return '💀';
}

// 根据排名返回奖牌
function getMedal(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export function PlayerRanking({ players }: PlayerRankingProps) {
  if (!players || players.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🏆 团员排行榜</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded w-12 mx-auto mb-2" />
              <div className="h-6 bg-gray-200 rounded w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">🏆 团员排行榜</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {players.map((player, index) => {
          const rank = index + 1;
          const isPositive = player.total_profit > 0;
          const emoji = getEmoji(rank, player.total_profit);
          const medal = getMedal(rank);
          
          return (
            <div
              key={player.player_name}
              className={`relative rounded-xl p-4 text-center transition-all hover:scale-105 ${
                rank === 1
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200'
                  : isPositive
                  ? 'bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200'
                  : 'bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200'
              }`}
            >
              {/* 排名徽章 */}
              <div className="absolute -top-2 -right-2 text-lg">
                {typeof medal === 'string' && medal.startsWith('#') ? (
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">
                    {medal}
                  </span>
                ) : (
                  <span>{medal}</span>
                )}
              </div>
              
              {/* Emoji */}
              <div className="text-4xl mb-2">{emoji}</div>
              
              {/* 名字 */}
              <p className="font-bold text-gray-900 mb-1">
                {PLAYER_NAMES[player.player_name as PlayerName]}
              </p>
              
              {/* 盈亏 */}
              <p className={`text-xl font-bold mb-3 ${
                isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {isPositive ? '+' : ''}{player.total_profit.toLocaleString()}
              </p>
              
              {/* 统计数据 */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>参与 {player.games_played} 场</p>
                <p>胜率 {player.win_rate}%</p>
                <p>场均 {player.avg_profit > 0 ? '+' : ''}{player.avg_profit}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
