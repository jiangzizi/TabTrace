# 代码模块化重构

## 概述

将原有的单体文件（background.js 179行、popup.js 354行、popup.css 767行）重构为模块化的目录结构，每个文件控制在 150 行以内，提高代码可维护性。

## 重构前的问题

1. **文件过大**：
   - `background.js`: 179 行
   - `popup.js`: 354 行
   - `popup.css`: 767 行

2. **职责混杂**：
   - 存储逻辑、追踪逻辑、事件处理混在一起
   - UI 渲染、数据处理、事件绑定混在一起

3. **难以维护**：
   - 查找代码困难
   - 修改容易引入副作用
   - 测试困难

## 重构后的结构

```
src/
├── background/           # Service Worker 模块
│   ├── index.js         # 入口文件 (40行)
│   ├── storage.js       # 存储管理 (140行)
│   ├── tracker.js       # 追踪逻辑 (130行)
│   └── events.js        # 事件处理 (80行)
├── popup/               # Popup 模块
│   ├── index.js         # 入口文件 (80行)
│   ├── mainPage.js      # 主页面逻辑 (160行)
│   ├── historyPage.js   # 历史页面逻辑 (140行)
│   └── styles/
│       ├── base.css     # 基础样式 (80行)
│       ├── components.css # 组件样式 (400行)
│       └── pages.css    # 页面样式 (100行)
└── shared/              # 共享模块
    └── utils.js         # 工具函数 (110行)
```

## 模块设计

### Background 模块

#### storage.js
负责所有与 `chrome.storage.local` 的交互：
- `init()`: 初始化存储结构
- `getAll()`: 获取所有统计数据
- `save()`: 保存统计数据
- `updateStats()`: 更新统计信息
- `getTodayStats()`: 获取今日统计
- `getDateStats()`: 获取指定日期统计

#### tracker.js
负责 Tab 追踪的核心逻辑：
- `start()`: 开始追踪指定 Tab
- `pause()`: 暂停追踪（窗口失去焦点）
- `resume()`: 恢复追踪（窗口获得焦点）
- `updateTitle()`: 更新当前 Tab 标题
- `isTrackableUrl()`: 检查 URL 是否可追踪

#### events.js
负责 Chrome 事件监听：
- `handleTabActivated()`: Tab 激活事件
- `handleTabUpdated()`: Tab 更新事件
- `handleWindowFocusChanged()`: 窗口焦点变化
- `register()`: 注册所有事件监听器

### Popup 模块

#### mainPage.js
负责主页面功能：
- `updateSitesList()`: 更新网站排行列表
- `updateTotalTime()`: 更新今日总时长
- `updateCurrentTab()`: 更新当前 Tab 信息
- `toggleExpand()`: 切换展开/收起状态

#### historyPage.js
负责历史页面功能：
- `show()`: 显示历史页面
- `hide()`: 返回主页面
- `loadData()`: 加载历史数据
- `switchPeriod()`: 切换时间段

### Shared 模块

#### utils.js
共享工具函数：
- `getTodayKey()`: 获取今日日期（北京时间）
- `extractDomain()`: 从 URL 提取域名
- `formatTime()`: 格式化时间（长格式）
- `formatTimeShort()`: 格式化时间（短格式）
- `getDateRange()`: 获取日期范围

## 模块通信方式

使用 IIFE 模式 + 全局命名空间：

```javascript
// 模块定义
(function(global) {
  'use strict';

  const Module = {
    method: function() { }
  };

  global.ModuleName = Module;

})(typeof window !== 'undefined' ? window : self);

// 模块使用
const result = ModuleName.method();
```

**优点**：
- 无需构建工具
- 兼容 Chrome Extension Manifest V3
- 清晰的依赖关系
- 避免全局污染

## 依赖关系

```
background/index.js
  ├── storage.js (依赖 utils.js)
  ├── tracker.js (依赖 storage.js, utils.js)
  └── events.js (依赖 tracker.js)

popup/index.js
  ├── mainPage.js (依赖 utils.js)
  ├── historyPage.js (依赖 utils.js)
  └── utils.js
```

## 文件加载顺序

### Service Worker
```javascript
importScripts(
  '../shared/utils.js',      // 必须先加载
  'storage.js',              // 依赖 utils
  'tracker.js',              // 依赖 storage, utils
  'events.js'                // 依赖 tracker
);
```

### Popup
```html
<script src="src/shared/utils.js"></script>
<script src="src/popup/mainPage.js"></script>
<script src="src/popup/historyPage.js"></script>
<script src="src/popup/index.js"></script>
```

## 重构收益

1. **可维护性**：每个文件职责单一，易于理解和修改
2. **可测试性**：模块间松耦合，便于单元测试
3. **可扩展性**：新增功能只需添加新模块
4. **代码复用**：共享工具函数统一管理
5. **团队协作**：多人可同时修改不同模块

## 注意事项

1. **加载顺序**：Service Worker 中 `importScripts` 顺序很重要
2. **全局命名空间**：避免模块名称冲突
3. **错误处理**：每个模块内部处理自己的错误
4. **性能**：模块拆分不会增加运行时开销
