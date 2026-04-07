import type { StatsOverview } from '@/lib/types/mahjong';

interface SummaryCardsProps {
  overview: StatsOverview | null;
}

export function SummaryCards({ overview }: SummaryCardsProps) {
  if (!overview) {
    return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: '总场次',
      value: overview.total_games,
      icon: '📊',
      format: (v: number) => `${v} 场`,
    },
    {
      label: '总抽水',
      value: overview.total_rake,
      icon: '💰',
      format: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      label: '总吃饭',
      value: overview.total_meal_cost,
      icon: '🍽️',
      format: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      label: '总台费',
      value: overview.total_table_fee,
      icon: '🎱',
      format: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      label: '总其他',
      value: overview.total_other ?? overview.total_other_cost ?? 0,
      icon: '📦',
      format: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      label: '团费结余',
      value: overview.current_fund_balance ?? 0,
      icon: '💵',
      format: (v: number) => `¥${v.toLocaleString()}`,
      highlight: true,
    },
    {
      label: '场均抽水',
      value: overview.avg_rake ?? 0,
      icon: '📈',
      format: (v: number) => `¥${Math.round(v)}`,
    },
    {
      label: '场均吃饭',
      value: overview.avg_meal ?? 0,
      icon: '🍜',
      format: (v: number) => `¥${Math.round(v)}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl p-4 shadow-sm border transition-transform hover:scale-105 ${
            card.highlight 
              ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white' 
              : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{card.icon}</span>
            <span className="text-sm text-gray-500">{card.label}</span>
          </div>
          <p className={`text-xl font-bold ${
            card.highlight && card.value < 0 ? 'text-red-600' : 'text-gray-900'
          }`}>
            {card.format(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
