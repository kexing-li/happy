import * as XLSX from 'xlsx';
import type { GameRecord, ParsedExcelData } from '@/lib/types/mahjong';

// 新版 Excel 列索引（基于规范化表格结构）
const COLUMN_MAP = {
  sequence_no: 0,    // A: 序号
  year: 1,           // B: 年份
  game_date: 2,      // C: 日期
  player_zhou: 3,    // D: 周
  player_xing: 4,    // E: 星
  player_fei: 5,     // F: 飞
  player_jun: 6,     // G: 俊
  player_ping: 7,    // H: 平
  rake: 8,           // I: 抽水
  table_fee: 9,      // J: 台费
  meal_cost: 10,     // K: 吃饭
  other_cost: 11,    // L: 其他开销
  daily_remaining: 12, // M: 当日剩余水费
  fund_balance: 13,  // N: 年末团费结余
  remarks: 14,       // O: 备注
  row_type: 15,      // P: 类型（记录/年度合计/总计）
};

// 解析单元格值为数字
function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  return isNaN(num) ? null : num;
}

// 解析单元格值为整数
function parseInteger(value: unknown): number {
  const num = parseNumber(value);
  return num === null ? 0 : Math.round(num);
}

// 判断是否为汇总行（根据类型列或内容判断）
function isSummaryRow(row: unknown[]): boolean {
  const rowType = String(row[COLUMN_MAP.row_type] || '').trim();
  const firstCell = String(row[0] || '').trim();
  
  // 新格式：检查类型列（中文不需要转小写）
  if (rowType === '年度合计' || rowType === '总计') {
    return true;
  }
  
  // 兼容旧格式：检查第一列是否包含"合计"或"总计"
  if (firstCell.includes('合计') || firstCell.includes('总计')) {
    return true;
  }
  
  return false;
}

// 判断是否为标题行或空行
function isHeaderOrEmptyRow(row: unknown[]): boolean {
  const firstCell = String(row[0] || '').trim();
  const secondCell = String(row[1] || '').trim();
  const rowType = String(row[COLUMN_MAP.row_type] || '').trim();
  
  // 如果类型列有值（记录/年度合计/总计），不是空行
  if (rowType === '记录' || rowType === '年度合计' || rowType === '总计') {
    return false;
  }
  
  // 标题行特征
  if (firstCell === '序号' || secondCell === '年份') {
    return true;
  }
  
  // 旧格式的分组标题行
  if (firstCell === '' && (secondCell === '' || secondCell === '团员' || secondCell === '开销' || secondCell === '结余')) {
    return true;
  }
  
  // 备注说明行
  if (firstCell === '备注：' || firstCell.startsWith('备注：')) {
    return true;
  }
  
  // 纯数字说明行（如 1. 2. 3. 等）
  if (/^\d+\.\s/.test(firstCell)) {
    return true;
  }
  
  // 完全空行
  if (row.every(cell => cell === null || cell === undefined || cell === '')) {
    return true;
  }
  
  return false;
}

// 提取年份
function extractYear(row: unknown[], lastKnownYear: number): number {
  const yearCell = row[COLUMN_MAP.year];
  const year = parseNumber(yearCell);
  
  if (year && year >= 2000 && year <= 2100) {
    return year;
  }
  
  // 如果当前行没有年份，检查第一列是否包含年份信息（兼容旧格式）
  const firstCell = String(row[0] || '');
  const yearMatch = firstCell.match(/(\d{4})年/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10);
  }
  
  // 使用上一个已知年份
  return lastKnownYear;
}

// 格式化日期
function formatDate(value: unknown): string {
  if (!value) return '';
  
  // 如果是数字（Excel 日期序列号），转换为日期字符串
  if (typeof value === 'number') {
    // Excel 日期序列号转换
    // Excel 的日期从 1900-01-01 开始，序列号 1 = 1900-01-01
    // 但 Excel 有个 bug，认为 1900 年是闰年，所以要减 1
    const excelEpoch = new Date(1899, 11, 30); // 1899-12-30
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  const strValue = String(value).trim();
  
  // 如果是 ISO 日期格式，提取日期部分
  if (strValue.includes('T')) {
    return strValue.split('T')[0];
  }
  
  // 如果已经是 YYYY-MM-DD 格式
  if (/^\d{4}-\d{2}-\d{2}$/.test(strValue)) {
    return strValue;
  }
  
  // 如果是 5 位数字字符串，当作 Excel 日期序列号处理
  if (/^\d{5}$/.test(strValue)) {
    const serialNumber = parseInt(strValue, 10);
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serialNumber * 24 * 60 * 60 * 1000);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  // 保留原格式（如 "10月3日"、"春节" 等）
  return strValue;
}

/**
 * 解析 Excel 文件
 * @param buffer Excel 文件的 ArrayBuffer
 * @returns 解析结果，包含记录和错误信息
 */
export function parseExcelFile(buffer: ArrayBuffer): ParsedExcelData {
  const records: Omit<GameRecord, 'id' | 'created_at'>[] = [];
  const errors: string[] = [];
  
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      errors.push('Excel 文件中没有找到工作表');
      return { records, errors };
    }
    
    const sheet = workbook.Sheets[sheetName];
    
    // 转换为二维数组
    const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, { 
      header: 1,
      defval: null,
    });
    
    if (data.length < 2) {
      errors.push('Excel 文件数据不足');
      return { records, errors };
    }
    
    let lastKnownYear = 2023; // 默认年份
    let rowNumber = 0;
    
    for (const row of data) {
      rowNumber++;
      
      // 跳过空行
      if (!row || (row as unknown[]).length === 0) {
        continue;
      }
      
      const rowArray = row as unknown[];
      
      // 跳过标题行和说明行
      if (isHeaderOrEmptyRow(rowArray)) {
        continue;
      }
      
      // 判断是否为汇总行
      const is_summary = isSummaryRow(rowArray);
      
      // 检查是否为总计行（类型列为"总计"）
      const rowType = String(rowArray[COLUMN_MAP.row_type] || '').trim();
      const isTotal = rowType === '总计';
      
      // 提取年份（总计行年份为 null）
      const year = isTotal ? null : extractYear(rowArray, lastKnownYear);
      if (!is_summary && year) {
        lastKnownYear = year;
      }
      
      // 提取序号
      const sequence_no = parseNumber(rowArray[COLUMN_MAP.sequence_no]);
      
      // 提取日期
      const game_date = formatDate(rowArray[COLUMN_MAP.game_date]);
      
      // 如果没有年份且没有有效数据且不是汇总行，跳过
      // 注意：总计行 year 为 null，但 is_summary 为 true
      if (!year && !sequence_no && !is_summary) {
        continue;
      }
      
      // 总计行特殊处理：year 为 null，game_date 设为 "总计"
      const finalGameDate = isTotal ? '总计' : (game_date || (is_summary ? `${year}年合计` : ''));
      
      try {
        const record: Omit<GameRecord, 'id' | 'created_at'> = {
          sequence_no: sequence_no,
          year: year,
          game_date: finalGameDate,
          player_zhou: parseNumber(rowArray[COLUMN_MAP.player_zhou]),
          player_xing: parseNumber(rowArray[COLUMN_MAP.player_xing]),
          player_fei: parseNumber(rowArray[COLUMN_MAP.player_fei]),
          player_jun: parseNumber(rowArray[COLUMN_MAP.player_jun]),
          player_ping: parseNumber(rowArray[COLUMN_MAP.player_ping]),
          rake: parseInteger(rowArray[COLUMN_MAP.rake]),
          table_fee: parseInteger(rowArray[COLUMN_MAP.table_fee]),
          meal_cost: parseInteger(rowArray[COLUMN_MAP.meal_cost]),
          other_cost: parseInteger(rowArray[COLUMN_MAP.other_cost]),
          daily_remaining: parseInteger(rowArray[COLUMN_MAP.daily_remaining]),
          fund_balance: parseInteger(rowArray[COLUMN_MAP.fund_balance]),
          remarks: rowArray[COLUMN_MAP.remarks] ? String(rowArray[COLUMN_MAP.remarks]).trim() : null,
          is_summary: is_summary,
        };
        
        // 有效性检查：至少有一个团员参与或者是汇总行
        const hasPlayerData = 
          record.player_zhou !== null ||
          record.player_xing !== null ||
          record.player_fei !== null ||
          record.player_jun !== null ||
          record.player_ping !== null;
        
        if (hasPlayerData || is_summary) {
          records.push(record);
        }
      } catch (err) {
        errors.push(`第 ${rowNumber} 行解析失败: ${err instanceof Error ? err.message : '未知错误'}`);
      }
    }
    
    if (records.length === 0) {
      errors.push('没有解析到有效的麻将记录');
    }
    
  } catch (err) {
    errors.push(`Excel 文件解析失败: ${err instanceof Error ? err.message : '未知错误'}`);
  }
  
  return { records, errors };
}