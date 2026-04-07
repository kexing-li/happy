// 团员名称
export type PlayerName = 'zhou' | 'xing' | 'fei' | 'jun' | 'ping';

// 团员中文名映射
export const PLAYER_NAMES: Record<PlayerName, string> = {
  zhou: '周',
  xing: '星',
  fei: '飞',
  jun: '俊',
  ping: '平',
};

// 团员颜色（用于图表）
export const PLAYER_COLORS: Record<PlayerName, string> = {
  zhou: '#10B981', // 绿色
  xing: '#3B82F6', // 蓝色
  fei: '#EF4444',  // 红色
  jun: '#F59E0B',  // 橙色
  ping: '#8B5CF6', // 紫色
};

// 单条麻将记录
export interface GameRecord {
  id: number;
  sequence_no: number | null;
  year: number | null;
  game_date: string;
  player_zhou: number | null;
  player_xing: number | null;
  player_fei: number | null;
  player_jun: number | null;
  player_ping: number | null;
  rake: number;
  table_fee: number;
  meal_cost: number;
  other_cost: number;
  daily_remaining: number;
  fund_balance: number;
  remarks: string | null;
  is_summary: boolean;
  created_at: string;
}

// 总览统计
export interface StatsOverview {
  total_games: number;
  total_rake: number;
  total_table_fee: number;
  total_meal_cost: number;
  total_other_cost: number;
  avg_rake: number | null;
  avg_meal: number | null;
  current_fund_balance: number | null;
  total_other: number;  // 其他列（L列）
}

// 团员统计
export interface PlayerStats {
  player_name: PlayerName;
  games_played: number;
  total_profit: number;
  wins: number;
  win_rate: number;
  avg_profit: number;
}

// 年度统计
export interface YearlyStats {
  year: number;
  total_games: number;
  total_rake: number;
  total_table_fee: number;
  total_meal_cost: number;
  total_other_cost: number;
  zhou_total: number;
  xing_total: number;
  fei_total: number;
  jun_total: number;
  ping_total: number;
}

// 趋势数据点
export interface TrendPoint {
  sequence_no: number;
  game_date: string;
  year: number;
  zhou_cumulative: number;
  xing_cumulative: number;
  fei_cumulative: number;
  jun_cumulative: number;
  ping_cumulative: number;
}

// 趣味记录
export interface FunRecord {
  type: 'max_single_win' | 'max_single_loss' | 'max_win_streak' | 'max_lose_streak' | 'max_yearly_meal';
  player_name: PlayerName | null;
  value: number;
  date: string | null;
  year: number | null;
  description: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
  year?: number;
  search?: string;
}

// 分页结果
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 用户信息（包含管理员标识）
export interface UserProfile {
  id: string;
  display_name: string | null;
  is_admin: boolean;
}

// 上传日志
export interface UploadLog {
  id: number;
  user_id: string;
  filename: string;
  file_size: number | null;
  row_count: number | null;
  uploaded_at: string;
}

// Excel 解析结果
export interface ParsedExcelData {
  records: Omit<GameRecord, 'id' | 'created_at'>[];
  errors: string[];
}
