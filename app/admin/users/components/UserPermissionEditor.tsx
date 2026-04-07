'use client';

import { useState, useTransition } from 'react';
import type { AdminUserView, AppPermission } from '@/lib/types/admin';
import { AVAILABLE_APPS } from '@/lib/types/admin';
import { updateUserPermissions, updateUserAdminStatus } from '../actions';

interface UserPermissionEditorProps {
  user: AdminUserView;
  currentUserId: string;
}

export function UserPermissionEditor({ user, currentUserId }: UserPermissionEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const isCurrentUser = user.id === currentUserId;

  const handlePermissionChange = (appId: AppPermission, checked: boolean) => {
    const newPermissions = checked
      ? [...user.app_permissions, appId]
      : user.app_permissions.filter(p => p !== appId);
    
    startTransition(async () => {
      setMessage(null);
      const result = await updateUserPermissions(user.id, newPermissions);
      if (result.success) {
        setMessage({ type: 'success', text: '权限已更新' });
      } else {
        setMessage({ type: 'error', text: result.error || '更新失败' });
      }
      setTimeout(() => setMessage(null), 2000);
    });
  };

  const handleAdminChange = (checked: boolean) => {
    startTransition(async () => {
      setMessage(null);
      const result = await updateUserAdminStatus(user.id, checked);
      if (result.success) {
        setMessage({ type: 'success', text: '管理员状态已更新' });
      } else {
        setMessage({ type: 'error', text: result.error || '更新失败' });
      }
      setTimeout(() => setMessage(null), 2000);
    });
  };

  return (
    <div className="space-y-3">
      {/* 应用权限 */}
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_APPS.map(app => (
          <label
            key={app.id}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
              user.app_permissions.includes(app.id)
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
            } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
          >
            <input
              type="checkbox"
              checked={user.app_permissions.includes(app.id)}
              onChange={(e) => handlePermissionChange(app.id, e.target.checked)}
              disabled={isPending}
              className="sr-only"
            />
            <span>{app.icon}</span>
            <span>{app.name}</span>
          </label>
        ))}
      </div>

      {/* 管理员开关 */}
      <div className="flex items-center gap-2">
        <label
          className={`relative inline-flex items-center ${
            isCurrentUser ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
          title={isCurrentUser ? '不能撤销自己的管理员权限' : '切换管理员状态'}
        >
          <input
            type="checkbox"
            checked={user.is_admin}
            onChange={(e) => handleAdminChange(e.target.checked)}
            disabled={isPending || isCurrentUser}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          <span className="ml-2 text-sm text-gray-600">
            管理员
            {isCurrentUser && <span className="text-xs text-gray-400 ml-1">(当前用户)</span>}
          </span>
        </label>
      </div>

      {/* 提示消息 */}
      {message && (
        <div
          className={`text-sm px-2 py-1 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
