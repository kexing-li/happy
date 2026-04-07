'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TrendPoint, PlayerName } from '@/lib/types/mahjong';
import { PLAYER_NAMES, PLAYER_COLORS } from '@/lib/types/mahjong';

interface TrendChartProps {
  data: TrendPoint[];
}

const players: PlayerName[] = ['zhou', 'xing', 'fei', 'jun', 'ping'];

export function TrendChart({ data }: TrendChartProps) {
  const [visiblePlayers, setVisiblePlayers] = useState<Record<PlayerName, boolean>>({
    zhou: true,
    xing: true,
    fei: true,
    jun: true,
    ping: true,
  });

  const togglePlayer = (player: PlayerName) => {
    setVisiblePlayers(prev => ({ ...prev, [player]: !prev[player] }));
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📈 盈亏趋势</h2>
        <div className="h-80 flex items-center justify-center text-gray-400">
          暂无数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">📈 盈亏趋势</h2>
        
        {/* 团员切换按钮 */}
        <div className="flex gap-2">
          {players.map(player => (
            <button
              key={player}
              onClick={() => togglePlayer(player)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                visiblePlayers[player]
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
              style={{
                backgroundColor: visiblePlayers[player] ? PLAYER_COLORS[player] : undefined,
              }}
            >
              {PLAYER_NAMES[player]}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="sequence_no"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `#${value}`}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value >= 0 ? '' : ''}${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value, name) => {
                const numValue = Number(value) || 0;
                const strName = String(name);
                return [
                  `${numValue >= 0 ? '+' : ''}${numValue.toLocaleString()}`,
                  PLAYER_NAMES[strName.replace('_cumulative', '') as PlayerName] || strName,
                ];
              }}
              labelFormatter={(label) => {
                const point = data.find(d => d.sequence_no === label);
                return point ? `第 ${label} 场 (${point.year}年 ${point.game_date})` : `第 ${label} 场`;
              }}
            />
            <Legend
              formatter={(value: string) => 
                PLAYER_NAMES[value.replace('_cumulative', '') as PlayerName] || value
              }
            />
            
            {visiblePlayers.zhou && (
              <Line
                type="monotone"
                dataKey="zhou_cumulative"
                stroke={PLAYER_COLORS.zhou}
                strokeWidth={2}
                dot={false}
                name="zhou_cumulative"
              />
            )}
            {visiblePlayers.xing && (
              <Line
                type="monotone"
                dataKey="xing_cumulative"
                stroke={PLAYER_COLORS.xing}
                strokeWidth={2}
                dot={false}
                name="xing_cumulative"
              />
            )}
            {visiblePlayers.fei && (
              <Line
                type="monotone"
                dataKey="fei_cumulative"
                stroke={PLAYER_COLORS.fei}
                strokeWidth={2}
                dot={false}
                name="fei_cumulative"
              />
            )}
            {visiblePlayers.jun && (
              <Line
                type="monotone"
                dataKey="jun_cumulative"
                stroke={PLAYER_COLORS.jun}
                strokeWidth={2}
                dot={false}
                name="jun_cumulative"
              />
            )}
            {visiblePlayers.ping && (
              <Line
                type="monotone"
                dataKey="ping_cumulative"
                stroke={PLAYER_COLORS.ping}
                strokeWidth={2}
                dot={false}
                name="ping_cumulative"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
