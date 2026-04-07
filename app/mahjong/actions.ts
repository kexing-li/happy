'use server';

import { createClient } from '@/lib/supabase/server';
import type { 
  StatsOverview, 
  PlayerStats, 
  YearlyStats, 
  TrendPoint, 
  GameRecord,
  PaginatedResult,
  UserProfile,
  FunRecord,
  PlayerName 
} from '@/lib/types/mahjong';

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, is_admin, app_permissions')
    .eq('id', user.id)
    .single();
  
  return profile;
}

/**
 * 获取总览统计
 */
export async function getOverview(): Promise<StatsOverview | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('stats_overview')
    .select('*')
    .single();
  
  if (error) {
    console.error('获取总览统计失败:', error);
    return null;
  }
  
  return data;
}

/**
 * 获取团员统计
 */
export async function getPlayerStats(): Promise<PlayerStats[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('stats_players')
    .select('*')
    .order('total_profit', { ascending: false });
  
  if (error) {
    console.error('获取团员统计失败:', error);
    return [];
  }
  
  return data || [];
}

/**
 * 获取年度统计
 */
export async function getYearlyStats(): Promise<YearlyStats[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('stats_yearly')
    .select('*')
    .order('year', { ascending: true });
  
  if (error) {
    console.error('获取年度统计失败:', error);
    return [];
  }
  
  return data || [];
}

/**
 * 获取趋势数据（用于折线图）
 */
export async function getTrendData(): Promise<TrendPoint[]> {
  const supabase = await createClient();
  
  // 获取所有非汇总记录，按序号排序
  const { data, error } = await supabase
    .from('game_records')
    .select('sequence_no, year, game_date, player_zhou, player_xing, player_fei, player_jun, player_ping')
    .eq('is_summary', false)
    .not('sequence_no', 'is', null)
    .order('sequence_no', { ascending: true });
  
  if (error) {
    console.error('获取趋势数据失败:', error);
    return [];
  }
  
  if (!data) return [];
  
  // 计算累计盈亏
  let zhou_cumulative = 0;
  let xing_cumulative = 0;
  let fei_cumulative = 0;
  let jun_cumulative = 0;
  let ping_cumulative = 0;
  
  const trendData: TrendPoint[] = data.map((record) => {
    zhou_cumulative += record.player_zhou || 0;
    xing_cumulative += record.player_xing || 0;
    fei_cumulative += record.player_fei || 0;
    jun_cumulative += record.player_jun || 0;
    ping_cumulative += record.player_ping || 0;
    
    return {
      sequence_no: record.sequence_no!,
      game_date: record.game_date,
      year: record.year,
      zhou_cumulative,
      xing_cumulative,
      fei_cumulative,
      jun_cumulative,
      ping_cumulative,
    };
  });
  
  return trendData;
}

/**
 * 获取详细记录（分页）- 包含年度合计行和总计行
 */
export async function getRecords(params: {
  page?: number;
  limit?: number;
  year?: number;
  search?: string;
}): Promise<PaginatedResult<GameRecord>> {
  const supabase = await createClient();
  
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;
  
  // 构建查询 - 包含所有记录（普通记录、年度合计、总计）
  let query = supabase
    .from('game_records')
    .select('*', { count: 'exact' });
  
  // 年份筛选（如果选了年份，只显示该年的记录和年度合计，不显示总计）
  if (params.year) {
    query = query.eq('year', params.year);
  }
  
  // 备注搜索（只搜索非汇总行）
  if (params.search) {
    query = query.ilike('remarks', `%${params.search}%`);
  }
  
  // 排序：先按 is_summary 降序（汇总行在最上面），再按年份降序，再按序号降序
  query = query
    .order('is_summary', { ascending: false })
    .order('year', { ascending: false, nullsFirst: false })
    .order('sequence_no', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error('获取详细记录失败:', error);
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }
  
  const total = count || 0;
  
  return {
    data: data || [],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * 获取所有年份列表
 */
export async function getYears(): Promise<number[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('game_records')
    .select('year')
    .eq('is_summary', false)
    .not('sequence_no', 'is', null);
  
  if (error) {
    console.error('获取年份列表失败:', error);
    return [];
  }
  
  const years = [...new Set(data?.map(r => r.year) || [])].sort((a, b) => b - a);
  return years;
}

/**
 * 获取趣味记录
 */
export async function getFunRecords(): Promise<FunRecord[]> {
  const supabase = await createClient();
  const funRecords: FunRecord[] = [];
  
  // 获取所有非汇总记录
  const { data: records } = await supabase
    .from('game_records')
    .select('*')
    .eq('is_summary', false)
    .not('sequence_no', 'is', null)
    .order('sequence_no', { ascending: true });
  
  if (!records || records.length === 0) return funRecords;
  
  // 定义团员字段
  const players: { key: PlayerName; field: keyof GameRecord }[] = [
    { key: 'zhou', field: 'player_zhou' },
    { key: 'xing', field: 'player_xing' },
    { key: 'fei', field: 'player_fei' },
    { key: 'jun', field: 'player_jun' },
    { key: 'ping', field: 'player_ping' },
  ];
  
  // 1. 单场最高盈利
  let maxWin = { player: '' as PlayerName, value: 0, date: '', year: 0 };
  // 2. 单场最大亏损
  let maxLoss = { player: '' as PlayerName, value: 0, date: '', year: 0 };
  
  for (const record of records) {
    for (const p of players) {
      const value = record[p.field] as number | null;
      if (value !== null) {
        if (value > maxWin.value) {
          maxWin = { player: p.key, value, date: record.game_date, year: record.year };
        }
        if (value < maxLoss.value) {
          maxLoss = { player: p.key, value, date: record.game_date, year: record.year };
        }
      }
    }
  }
  
  if (maxWin.value > 0) {
    funRecords.push({
      type: 'max_single_win',
      player_name: maxWin.player,
      value: maxWin.value,
      date: maxWin.date,
      year: maxWin.year,
      description: '单场最高盈利',
    });
  }
  
  if (maxLoss.value < 0) {
    funRecords.push({
      type: 'max_single_loss',
      player_name: maxLoss.player,
      value: Math.abs(maxLoss.value),
      date: maxLoss.date,
      year: maxLoss.year,
      description: '单场最大亏损',
    });
  }
  
  // 3. 最长连胜
  const streaks: Record<PlayerName, { current: number; max: number; maxEndIndex: number }> = {
    zhou: { current: 0, max: 0, maxEndIndex: 0 },
    xing: { current: 0, max: 0, maxEndIndex: 0 },
    fei: { current: 0, max: 0, maxEndIndex: 0 },
    jun: { current: 0, max: 0, maxEndIndex: 0 },
    ping: { current: 0, max: 0, maxEndIndex: 0 },
  };
  
  records.forEach((record, index) => {
    for (const p of players) {
      const value = record[p.field] as number | null;
      if (value !== null) {
        if (value > 0) {
          streaks[p.key].current++;
          if (streaks[p.key].current > streaks[p.key].max) {
            streaks[p.key].max = streaks[p.key].current;
            streaks[p.key].maxEndIndex = index;
          }
        } else {
          streaks[p.key].current = 0;
        }
      }
    }
  });
  
  const maxStreak = Object.entries(streaks).reduce((max, [player, s]) => 
    s.max > max.max ? { player: player as PlayerName, ...s } : max
  , { player: 'zhou' as PlayerName, current: 0, max: 0, maxEndIndex: 0 });
  
  if (maxStreak.max >= 3) {
    funRecords.push({
      type: 'max_win_streak',
      player_name: maxStreak.player,
      value: maxStreak.max,
      date: records[maxStreak.maxEndIndex]?.game_date || null,
      year: records[maxStreak.maxEndIndex]?.year || null,
      description: '最长连胜',
    });
  }
  
  // 4. 年度吃饭之最
  const mealByYear: Record<number, number> = {};
  for (const record of records) {
    if (!mealByYear[record.year]) {
      mealByYear[record.year] = 0;
    }
    mealByYear[record.year] += record.meal_cost || 0;
  }
  
  const maxMealYear = Object.entries(mealByYear).reduce((max, [year, total]) => 
    total > max.total ? { year: parseInt(year), total } : max
  , { year: 0, total: 0 });
  
  if (maxMealYear.total > 0) {
    funRecords.push({
      type: 'max_yearly_meal',
      player_name: null,
      value: maxMealYear.total,
      date: null,
      year: maxMealYear.year,
      description: '年度吃饭之最',
    });
  }
  
  return funRecords;
}
