'use server';

import { createClient } from '@/lib/supabase/server';
import { parseExcelFile } from '@/lib/excel/parser';
import { revalidatePath } from 'next/cache';

export interface UploadResult {
  success: boolean;
  message: string;
  recordCount?: number;
  errors?: string[];
}

/**
 * 上传并处理 Excel 文件
 */
export async function uploadExcelFile(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient();
  
  // 1. 检查用户登录状态
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: '请先登录' };
  }
  
  // 2. 检查管理员权限
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  
  if (profileError || !profile?.is_admin) {
    return { success: false, message: '只有管理员才能上传文件' };
  }
  
  // 3. 获取上传的文件
  const file = formData.get('file') as File | null;
  if (!file) {
    return { success: false, message: '请选择要上传的文件' };
  }
  
  // 4. 验证文件类型
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];
  if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    return { success: false, message: '请上传 Excel 文件（.xlsx 或 .xls）' };
  }
  
  // 5. 解析 Excel 文件
  const buffer = await file.arrayBuffer();
  const { records, errors } = parseExcelFile(buffer);
  
  if (records.length === 0) {
    return { 
      success: false, 
      message: '没有解析到有效数据',
      errors 
    };
  }
  
  // 6. 删除旧数据并插入新数据（使用事务）
  try {
    // 删除所有旧记录
    const { error: deleteError } = await supabase
      .from('game_records')
      .delete()
      .gte('id', 0); // 删除所有记录
    
    if (deleteError) {
      console.error('删除旧数据失败:', deleteError);
      return { success: false, message: `删除旧数据失败: ${deleteError.message}` };
    }
    
    // 插入新记录（分批插入，每批 100 条）
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('game_records')
        .insert(batch);
      
      if (insertError) {
        console.error('插入数据失败:', insertError);
        return { success: false, message: `插入数据失败: ${insertError.message}` };
      }
    }
    
    // 记录上传日志
    await supabase.from('upload_logs').insert({
      user_id: user.id,
      filename: file.name,
      file_size: file.size,
      row_count: records.length,
    });
    
  } catch (err) {
    console.error('数据库操作失败:', err);
    return { 
      success: false, 
      message: `数据库操作失败: ${err instanceof Error ? err.message : '未知错误'}` 
    };
  }
  
  // 7. 重新验证缓存
  revalidatePath('/mahjong');
  
  return {
    success: true,
    message: `成功导入 ${records.length} 条记录`,
    recordCount: records.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * 获取上传历史
 */
export async function getUploadHistory() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('upload_logs')
    .select('*')
    .order('uploaded_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('获取上传历史失败:', error);
    return [];
  }
  
  return data;
}
