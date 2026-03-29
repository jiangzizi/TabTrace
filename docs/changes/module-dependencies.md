# 模块依赖关系

## 概述

本文档描述 TabTrace 各模块之间的依赖关系，帮助理解代码组织和加载顺序。

## 依赖图

```
┌─────────────────────────────────────────────────────────────┐
│                        Shared Layer                          │
│                    ┌───────────────┐                        │
│                    │   utils.js    │                        │
│                    │  (工具函数)    │                        │
│                    └───────┬───────┘                        │
└────────────────────────────┼────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
         ▼                                       ▼
┌──────────────────────┐              ┌──────────────────────┐
│   Background Layer   │              │     Popup Layer      │
│  ┌──────────────┐    │              │  ┌──────────────┐   │
│  │ storage.js   │◄───┤              │  │ mainPage.js  │◄──┤
│  │  (存储管理)   │    │              │  │  (主页面)     │   │
│  └──────┬───────┘    │              │  └──────────────┘   │
│         │            │              │                     │
│         ▼            │              │  ┌──────────────┐   │
│  ┌──────────────┐    │              │  │historyPage.js│◄──┤
│  │ tracker.js   │◄───┤              │  │  (历史页面)   │   │
│  │  (追踪逻辑)   │    │              │  └──────────────┘   │
│  └──────┬───────┘    │              │                     │
│         │            │              │  ┌──────────────┐   │
│         ▼            │              │  │  index.js    │   │
│  ┌──────────────┐    │              │  │  (入口文件)   │   │
│  │  events.js   │◄───┘              │  └──────────────┘   │
│  │  (事件处理)   │                   └──────────────────────┘
│  └──────────────┘
│
│  ┌──────────────┐
│  │  index.js    │
│  │  (入口文件)   │
│  └──────────────┘
└──────────────────────┘
```

## 详细依赖

### Shared Layer

**utils.js**
- 无依赖
- 被所有其他模块依赖
- 导出：`TabTraceUtils`

### Background Layer

**storage.js**
- 依赖：`utils.js` (使用 `getTodayKey`, `extractDomain`)
- 导出：`TabTraceStorage`

**tracker.js**
- 依赖：
  - `utils.js` (使用 `extractDomain`)
  - `storage.js` (使用 `updateStats`)
- 导出：`TabTraceTracker`

**events.js**
- 依赖：`tracker.js` (使用 `start`, `pause`, `resume`, `isTrackableUrl`)
- 导出：`TabTraceEvents`

**index.js (Background 入口)**
- 依赖：
  - `storage.js` (使用 `init`)
  - `tracker.js` (使用 `resume`)
  - `events.js` (使用 `register`)
- 不导出，直接执行初始化

### Popup Layer

**mainPage.js**
- 依赖：`utils.js` (使用 `getTodayKey`, `formatTime`, `formatTimeShort`)
- 导出：`TabTraceMainPage`

**historyPage.js**
- 依赖：`utils.js` (使用 `getDateRange`, `formatTime`, `formatTimeShort`)
- 导出：`TabTraceHistoryPage`

**index.js (Popup 入口)**
- 依赖：
  - `mainPage.js` (使用 `updateSitesList`, `updateTotalTime`, `updateCurrentTab`, `toggleExpand`)
  - `historyPage.js` (使用 `show`, `hide`, `switchPeriod`)
- 不导出，直接执行初始化

## 加载顺序

### Service Worker 加载顺序

```javascript
// 1. 基础工具
importScripts('../shared/utils.js');

// 2. 数据层
importScripts('storage.js');

// 3. 业务逻辑层
importScripts('tracker.js');

// 4. 事件层
importScripts('events.js');

// 5. 入口执行
importScripts('index.js');
```

**顺序重要性**：
- `utils.js` 必须最先加载，因为其他模块依赖它
- `storage.js` 必须在 `tracker.js` 之前加载
- `tracker.js` 必须在 `events.js` 之前加载

### Popup 加载顺序

```html
<!-- 1. 基础工具 -->
<script src="src/shared/utils.js"></script>

<!-- 2. 页面逻辑 -->
<script src="src/popup/mainPage.js"></script>
<script src="src/popup/historyPage.js"></script>

<!-- 3. 入口执行 -->
<script src="src/popup/index.js"></script>
```

**顺序重要性**：
- `utils.js` 必须最先加载
- `mainPage.js` 和 `historyPage.js` 可以并行加载（无相互依赖）
- `index.js` 必须最后加载

## 模块间通信

### Background 内部通信

模块通过全局命名空间直接访问：

```javascript
// tracker.js 访问 storage.js
const Storage = self.TabTraceStorage;
await Storage.updateStats(url, title, timeSpent);

// events.js 访问 tracker.js
const Tracker = self.TabTraceTracker;
Tracker.start(tabId, url, title);
```

### Popup 内部通信

```javascript
// index.js 访问 mainPage.js
const MainPage = window.TabTraceMainPage;
MainPage.updateSitesList();

// index.js 访问 historyPage.js
const HistoryPage = window.TabTraceHistoryPage;
HistoryPage.show();
```

### Background 与 Popup 通信

通过 `chrome.storage.local` 间接通信：

```javascript
// Background 写入数据
chrome.storage.local.set({ dailyStats: data });

// Popup 读取数据
chrome.storage.local.get(['dailyStats'], (result) => {
  const data = result.dailyStats;
});
```

## 循环依赖检查

当前设计无循环依赖：

```
utils.js ──┬──► storage.js ──► tracker.js ──► events.js
           │
           ├──► mainPage.js
           │
           └──► historyPage.js
```

## 添加新模块的指南

1. **确定模块层级**：
   - 工具函数 → `shared/`
   - Background 逻辑 → `background/`
   - Popup 逻辑 → `popup/`

2. **确定依赖关系**：
   - 需要哪些已有模块？
   - 会被哪些模块使用？

3. **遵循加载顺序**：
   - 被依赖的模块先加载
   - 入口文件最后加载

4. **导出命名规范**：
   - 使用 `TabTrace` 前缀
   - 使用 PascalCase 命名
   - 例如：`TabTraceNewModule`
