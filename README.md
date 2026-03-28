# 天气日历应用

基于 Vue3 + TailwindCSS 构建的天气日历应用，融合日历、黄历和实时天气三大功能。采用自然禅意的设计风格，以柔和自然色系营造宁静致远的氛围。

## 项目结构

```
.
├── README.md                 # 项目文档
├── .gitignore               # Git 忽略配置
├── docker-compose.yml       # Docker Compose 配置文件
└── frontend-user/           # 前端代码目录
    ├── Dockerfile           # Docker 镜像构建文件
    ├── index.html           # 入口 HTML
    ├── package.json         # 项目依赖
    ├── vite.config.ts       # Vite 配置
    ├── vitest.config.ts     # Vitest 测试配置
    ├── tsconfig.json        # TypeScript 配置
    ├── tailwind.config.js   # TailwindCSS 配置
    ├── eslint.config.js     # ESLint 配置
    ├── public/              # 静态资源
    └── src/                 # 源代码
        ├── main.ts          # 应用入口
        ├── App.vue          # 根组件
        ├── components/      # Vue 组件
        ├── composables/     # 组合式函数
        ├── services/        # 业务服务
        ├── utils/           # 工具函数
        └── types/           # 类型定义
```

## How to Run

### 环境要求

#### 本地开发环境
- Node.js >= 18.0.0
- npm >= 9.0.0

#### Docker 部署环境
- Docker 20.10+
- Docker Compose 2.0+

### 本地开发

```bash
# 进入前端目录
cd frontend-user

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
cd frontend-user
npm run build
```

构建产物输出到 `frontend-user/dist/` 目录。

### 预览生产版本

```bash
cd frontend-user
npm run preview
```

### Docker Compose 一键部署

#### 启动服务

```bash
# 在项目根目录执行
docker-compose up -d
```

服务启动后，访问 http://localhost

#### 查看日志

```bash
# 查看服务日志
docker-compose logs -f frontend
```

#### 停止服务

```bash
# 停止服务但保留容器
docker-compose stop

# 停止并删除容器、网络
docker-compose down

# 停止并删除容器、网络、镜像
docker-compose down --rmi all
```

#### 重新构建镜像

当代码发生变化时，需要重新构建镜像：

```bash
# 重新构建镜像并启动
docker-compose up -d --build
```

### Docker 手动部署（不使用 Compose）

#### 构建镜像

```bash
cd frontend-user
docker build -t zen-calendar-frontend .
```

#### 运行容器

```bash
docker run -d -p 80:80 --name zen-calendar-frontend zen-calendar-frontend
```

### 代码检查与格式化

```bash
cd frontend-user
npm run lint      # ESLint 检查
npm run format    # Prettier 格式化
```

## Services

本项目使用以下外部服务：

| 服务 | 用途 | 说明 |
|------|------|------|
| Open-Meteo Forecast API | 当前/未来天气 | 免费，无需 API Key |
| Open-Meteo Archive API | 历史天气数据 | 支持查询过去日期天气 |
| Google Fonts | 字体加载 | Noto Sans SC / Noto Serif SC |

天气 API 端点：
- 当前天气：`https://api.open-meteo.com/v1/forecast`
- 历史天气：`https://archive-api.open-meteo.com/v1/archive`

地理定位：使用浏览器 Geolocation API，若用户拒绝授权则默认使用北京坐标。

## 测试账号

本项目为纯前端应用，无需登录账号。

## 题目内容

我想使用vue创建一个前端项目，主要适配平板电脑，可以显示日历和黄历，使用实时天气作为背景显示天气

### 项目简介

天气日历是一款融合传统文化与现代设计的日历应用，提供：
- 公历/农历双历显示
- 传统黄历宜忌查询
- 实时天气背景动效

### 功能说明

#### 日历功能
- 月视图展示，支持前后月份切换
- 公历日期与农历日期同步显示
- 今日高亮标识，选中日期状态
- 传统节日、公历节日、24节气标注

#### 黄历功能
- 侧边抽屉展示完整黄历信息
- 天干地支（年柱、月柱、日柱）
- 每日宜忌事项
- 吉时信息（六吉时）
- 五行、冲煞信息

#### 天气功能
- 自动获取用户地理位置
- 根据天气类型切换背景渐变
- 雨天/雪天粒子动画效果
- 支持查看历史日期天气

### 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 构建工具 | Vite |
| 样式 | TailwindCSS |
| 测试 | Vitest + Vue Test Utils |
| 代码规范 | ESLint + Prettier |

### 主要组件

```
frontend-user/src/
├── components/           # Vue 组件
│   ├── CalendarView.vue     # 日历主视图（月份导航、日期网格）
│   ├── CalendarCell.vue     # 日期单元格（公历、农历、节日）
│   ├── AlmanacDrawer.vue    # 黄历抽屉（天干地支、宜忌、吉时）
│   ├── WeatherBackground.vue # 天气背景（渐变、粒子）
│   ├── ParticleCanvas.vue   # 粒子画布（雨滴、雪花动画）
│   └── WeatherIcon.vue      # 天气图标
├── composables/          # 组合式函数
│   ├── useCalendar.ts       # 日历状态管理
│   ├── useWeather.ts        # 天气数据获取
│   ├── useAlmanac.ts        # 黄历数据管理
│   └── useParticles.ts      # 粒子动画控制
├── services/             # 业务服务
│   ├── lunarService.ts      # 农历转换服务
│   ├── almanacService.ts    # 黄历计算服务
│   └── weatherService.ts    # 天气 API 服务
├── utils/                # 工具函数
│   └── dateUtils.ts         # 日期处理工具
└── types/                # TypeScript 类型定义
    └── index.ts
```

### 使用指南

1. 打开应用后，日历默认显示当前月份，今日日期高亮显示
2. 点击任意日期可选中该日期，天气背景会切换为该日期的天气
3. 点击右上角「黄历」按钮或从屏幕右侧边缘向左滑动，打开黄历抽屉
4. 黄历抽屉显示选中日期的完整黄历信息
5. 点击抽屉外部区域或按 ESC 键关闭抽屉
6. 使用日历顶部的左右箭头切换月份

### 黄历数据生成方式与算法原理

黄历数据完全在前端本地计算生成，无需后端服务。

#### 1. 农历转换算法

使用农历数据表（1900-2100年）进行公历到农历的转换：

```typescript
// 农历数据表结构（每年一个16进制数）
// - 低12位：每月大小月信息（1=大月30天，0=小月29天）
// - 第13-16位：闰月月份（0表示无闰月）
// - 第17-20位：闰月大小
const LUNAR_INFO = [0x04bd8, 0x04ae0, ...]
```

转换步骤：
1. 以1900年1月31日（农历正月初一）为基准
2. 计算目标日期与基准日期的天数差
3. 逐年累减天数，确定农历年份
4. 逐月累减天数，确定农历月份（含闰月处理）
5. 剩余天数即为农历日期

#### 2. 天干地支计算

```typescript
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
```

- 年柱：以立春为界，`(年份 - 4) % 60` 对应六十甲子
- 月柱：月干由年干推算 `(年干序号 * 2 + 月份) % 10`，月支固定（正月寅、二月卯...）
- 日柱：以1900年1月1日（甲戌日）为基准，计算天数差后取模

#### 3. 宜忌计算

基于建除十二神的简化算法：

```typescript
// 根据日干支的六十甲子序号确定宜忌
const combinedIndex = (ganIndex * 12 + zhiIndex) % 60
const suitableCount = 4 + (combinedIndex % 5)  // 4-8个宜事项
const avoidCount = 3 + (combinedIndex % 4)     // 3-6个忌事项
```

宜忌事项从预定义列表中按规则选取，确保同一日期的宜忌不重复。

#### 4. 吉时计算

基于六吉时（青龙、明堂、金匮、天德、玉堂、司命）：

```typescript
// 六吉时的地支偏移（基于日支）
const luckyOffsets = [0, 1, 4, 5, 8, 9]
// 吉时地支 = (日支索引 + 偏移) % 12
```

#### 5. 五行与冲煞

- 五行：天干五行 + 地支五行组合（如甲子日为「木水」）
- 冲煞：地支六冲关系（子午冲、丑未冲...）+ 煞方位

```typescript
const ZHI_CHONG = { '子': '午', '丑': '未', '寅': '申', ... }
const SHA_DIRECTION = { '子': '南', '丑': '东', '寅': '北', ... }
```

#### 6. 节气计算

使用节气数据表，记录每个节气相对于基准时间的分钟偏移：

```typescript
const SOLAR_TERM_INFO = [0, 21208, 42467, 63836, ...]
// 节气时间 = 基准时间 + 偏移分钟 + 年份偏移
```

### 运行测试

```bash
cd frontend-user
npm test           # 运行所有测试
npm run test:watch # 监听模式
```

测试覆盖 316 个用例，包括：
- 单元测试：工具函数、服务层
- 组件测试：Vue 组件渲染与交互
- 集成测试：组合式函数
