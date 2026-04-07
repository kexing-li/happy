# 任务列表

## Phase 1: 基础设施 ✅

- [x] **1.1 安装依赖**
- [x] **1.2 创建类型定义**
- [x] **1.3 创建 Excel 解析器**

## Phase 2: 上传功能 ✅

- [x] **2.1 创建上传页面**
- [x] **2.2 实现上传 Server Action**

## Phase 3: 统计仪表盘 ✅

- [x] **3.1 创建数据查询 Actions**
- [x] **3.2 创建布局和主页**
- [x] **3.3 实现 SummaryCards 组件**（含"其他"列）
- [x] **3.4 实现 PlayerRanking 组件**
- [x] **3.5 实现 TrendChart 组件**
- [x] **3.6 实现 YearlyStats 组件**
- [x] **3.7 实现 RecordTable 组件**（含年度合计、总计行）
- [x] **3.8 实现 UploadButton 组件**

## Phase 4: 趣味功能 ✅

- [x] **4.1 实现连胜/连败计算**
- [x] **4.2 实现 FunRecords 组件**

## Phase 5: 额外功能 ✅

- [x] **5.1 创建 Dashboard 应用中心**
- [x] **5.2 登录后自动跳转**
- [x] **5.3 已登录用户访问首页自动跳转**
- [x] **5.4 生成规范化 Excel 模板**

---

## ✅ 全部完成！

### 已实现功能

| 功能 | 状态 |
|------|------|
| 用户登录/登出 | ✅ |
| 应用中心 Dashboard | ✅ |
| 管理员上传 Excel | ✅ |
| 总览统计卡片（8项指标） | ✅ |
| 团员排行榜（盈亏、胜率、场均） | ✅ |
| 盈亏趋势折线图 | ✅ |
| 年度统计（MVP/贡献王） | ✅ |
| 趣味榜单（单场最高、连胜等） | ✅ |
| 详细记录表格（分页、筛选、搜索） | ✅ |
| 年度合计行 + 总计行显示 | ✅ |
| 规范化 Excel 模板 | ✅ |

### 文件结构

```
app/
├── dashboard/page.tsx          # 应用中心
├── mahjong/
│   ├── layout.tsx              # 登录检查
│   ├── page.tsx                # 统计仪表盘
│   ├── actions.ts              # 数据查询
│   ├── components/
│   │   ├── SummaryCards.tsx
│   │   ├── PlayerRanking.tsx
│   │   ├── TrendChart.tsx
│   │   ├── YearlyStats.tsx
│   │   ├── FunRecords.tsx
│   │   └── RecordTable.tsx
│   └── upload/
│       ├── page.tsx
│       └── actions.ts
lib/
├── types/mahjong.ts
└── excel/parser.ts
```

### 数据库

- `profiles` - 用户信息
- `game_records` - 麻将记录
- `upload_logs` - 上传日志
- `stats_overview` - 总览统计视图
- `stats_players` - 团员统计视图
- `stats_yearly` - 年度统计视图