// 应用权限标识符
export type AppPermission = 'mahjong' | 'todos';

// 可用应用列表
export const AVAILABLE_APPS: { id: AppPermission; name: string; icon: string }[] = [
  { id: 'mahjong', name: '麻将统计', icon: '🀄' },
  { id: 'todos', name: 'Todo', icon: '✅' },
];

// 用户完整信息（管理员视图）
export interface AdminUserView {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
  app_permissions: AppPermission[];
  created_at: string;
}
