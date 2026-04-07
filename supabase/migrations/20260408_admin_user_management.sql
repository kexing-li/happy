-- =====================================================
-- Admin User Management - Database Migration
-- =====================================================

-- 1.1 添加 app_permissions 字段
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS app_permissions TEXT[] DEFAULT '{}';

-- 1.2 为现有管理员设置默认权限
UPDATE profiles 
SET app_permissions = ARRAY['mahjong'] 
WHERE is_admin = true AND (app_permissions IS NULL OR app_permissions = '{}');

-- 1.3 创建 RLS 策略：管理员可读取所有 profiles
-- 先删除可能存在的旧策略
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id 
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 1.4 创建 RLS 策略：管理员可更新所有 profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 验证结果
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'app_permissions';
