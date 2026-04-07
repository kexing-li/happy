'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GameRecord, PaginatedResult } from '@/lib/types/mahjong';
import { PLAYER_NAMES } from '@/lib/types/mahjong';
import { getRecords, getYears } from '../actions';

export function RecordTable() {
  const [data, setData] = useState<PaginatedResult<GameRecord> | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getRecords({ page, limit: 50, year: selectedYear, search });
    setData(result);
    setLoading(false);
  }, [page, selectedYear, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    getYears().then(setYears);
  }, []);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const formatProfit = (value: number | null) => {
    if (value === null) return '-';
    return (
      <span className={value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-600' : ''}>
        {value > 0 ? '+' : ''}{value}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">📋 详细记录</h2>
      
      {/* 筛选器 */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* 搜索 */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="搜索备注..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
          >
            搜索
          </button>
        </div>
        
        {/* 年份筛选 */}
        <select
          value={selectedYear || ''}
          onChange={(e) => {
            setSelectedYear(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">全部年份</option>
          {years.map(year => (
            <option key={year} value={year}>{year}年</option>
          ))}
        </select>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="py-3 px-2 text-left font-medium text-gray-600">#</th>
              <th className="py-3 px-2 text-left font-medium text-gray-600">日期</th>
              <th className="py-3 px-2 text-right font-medium text-gray-600">{PLAYER_NAMES.zhou}</th>
              <th className="py-3 px-2 text-right font-medium text-gray-600">{PLAYER_NAMES.xing}</th>
              <th className="py-3 px-2 text-right font-medium text-gray-600">{PLAYER_NAMES.fei}</th>
              <th className="py-3 px-2 text-right font-medium text-gray-600">{PLAYER_NAMES.jun}</th>
              <th className="py-3 px-2 text-right font-medium text-gray-600">{PLAYER_NAMES.ping}</th>
              <th className="py-3 px-2 text-right font-medium text-gray-600">抽水</th>
              <th className="py-3 px-2 text-right font-medium text-gray-600">台费</th>
              <th className="py-3 px-2 text-right font-medium text-gray-600">吃饭</th>
              <th className="py-3 px-2 text-right font-medium text-gray-600">其他</th>
              <th className="py-3 px-2 text-left font-medium text-gray-600">备注</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <td key={j} className="py-3 px-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            ) : (
              data?.data.map((record) => {
                // 判断是否为总计行（is_summary=true 且 year 为空）
                const isTotal = record.is_summary && !record.year;
                const isYearlySummary = record.is_summary && record.year;
                
                return (
                  <tr 
                    key={record.id} 
                    className={`border-b hover:bg-gray-50 ${
                      isTotal
                        ? 'bg-emerald-100 border-emerald-300 font-bold'
                        : isYearlySummary 
                        ? 'bg-amber-50 border-amber-200 font-semibold' 
                        : 'border-gray-100'
                    }`}
                  >
                    <td className={`py-3 px-2 ${
                      isTotal ? 'text-emerald-800' : isYearlySummary ? 'text-amber-700' : 'text-gray-500'
                    }`}>
                      {isTotal ? '🏆' : isYearlySummary ? '📊' : record.sequence_no}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      {isTotal ? (
                        <span className="text-emerald-800 font-bold">🎯 总计</span>
                      ) : isYearlySummary ? (
                        <span className="text-amber-700 font-semibold">{record.year}年合计</span>
                      ) : (
                        <>
                          <span className="text-gray-400 text-xs">{record.year}年</span>{' '}
                          {record.game_date}
                        </>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-medium">{formatProfit(record.player_zhou)}</td>
                    <td className="py-3 px-2 text-right font-medium">{formatProfit(record.player_xing)}</td>
                    <td className="py-3 px-2 text-right font-medium">{formatProfit(record.player_fei)}</td>
                    <td className="py-3 px-2 text-right font-medium">{formatProfit(record.player_jun)}</td>
                    <td className="py-3 px-2 text-right font-medium">{formatProfit(record.player_ping)}</td>
                    <td className={`py-3 px-2 text-right ${
                      isTotal ? 'text-emerald-800' : isYearlySummary ? 'text-amber-700' : 'text-gray-600'
                    }`}>
                      {record.rake}
                    </td>
                    <td className={`py-3 px-2 text-right ${
                      isTotal ? 'text-emerald-800' : isYearlySummary ? 'text-amber-700' : 'text-gray-600'
                    }`}>
                      {record.table_fee}
                    </td>
                    <td className={`py-3 px-2 text-right ${
                      isTotal ? 'text-emerald-800' : isYearlySummary ? 'text-amber-700' : 'text-gray-600'
                    }`}>
                      {record.meal_cost || '-'}
                    </td>
                    <td className={`py-3 px-2 text-right ${
                      isTotal ? 'text-emerald-800' : isYearlySummary ? 'text-amber-700' : 'text-gray-600'
                    }`}>
                      {record.other_cost || '-'}
                    </td>
                    <td className="py-3 px-2 text-gray-500 max-w-[150px] truncate" title={record.remarks || ''}>
                      {record.remarks || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            共 {data.total} 条记录，第 {data.page} / {data.totalPages} 页
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
