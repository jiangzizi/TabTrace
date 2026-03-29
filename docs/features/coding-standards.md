# 编码规范

## 概述

本文档定义 TabTrace 项目的编码规范，确保代码风格一致性。

## 文件组织

### 目录结构

```
src/
├── background/     # Service Worker 代码
├── popup/          # Popup UI 代码
└── shared/         # 共享代码
```

### 文件命名

- **JavaScript**: camelCase, 例如 `mainPage.js`
- **CSS**: kebab-case, 例如 `base.css`
- **模块名**: PascalCase, 例如 `TabTraceStorage`

## JavaScript 规范

### 模块模式

使用 IIFE 模式定义模块：

```javascript
(function(global) {
  'use strict';

  // 模块代码
  const Module = {
    method: function() {
      // 实现
    }
  };

  // 导出
  global.ModuleName = Module;

})(typeof window !== 'undefined' ? window : self);
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `activeTabId`, `totalTime` |
| 常量 | UPPER_SNAKE_CASE | `TOP_SITES_COUNT`, `MAX_TIME_INTERVAL` |
| 函数 | camelCase | `updateSitesList()`, `formatTime()` |
| 对象/模块 | PascalCase | `TabTraceStorage`, `TabTraceTracker` |
| 私有方法 | _前缀 | `_updateExpandButton()` |

### 注释规范

使用中文注释，JSDoc 格式：

```javascript
/**
 * 获取今日日期字符串（以北京时间为准）
 * @param {string} period - 时间段: 'week' | 'month' | 'year'
 * @returns {string[]} 日期字符串数组
 */
function getDateRange(period) {
  // 实现
}
```

### 异步处理

优先使用 async/await：

```javascript
// 推荐
async function loadData() {
  const data = await Storage.getAll();
  return data;
}

// 避免（除非必要）
function loadData() {
  return Storage.getAll().then(data => data);
}
```

### 错误处理

```javascript
async function updateCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true });
    // 处理
  } catch (error) {
    console.error('Error updating current tab:', error);
  }
}
```

## CSS 规范

### 文件组织

```
styles/
├── base.css        # 变量、重置、动画
├── components.css  # 可复用组件
└── pages.css       # 页面特定样式
```

### 命名规范

使用 BEM-like 命名：

```css
/* Block */
.site-item { }

/* Element */
.site-item__rank { }
.site-item__domain { }

/* Modifier */
.site-item--expanded { }
```

实际使用简化的命名：

```css
.site-item { }
.site-rank { }
.site-domain { }
.sites-list.expanded { }
```

### CSS 变量

所有颜色、尺寸使用 CSS 变量：

```css
:root {
  --bg-primary: #FAFBFC;
  --text-primary: #111827;
  --accent-blue: #3B82F6;
  --radius-sm: 8px;
}
```

## 代码长度限制

### 文件长度

- **目标**: 每个文件不超过 150 行
- **最大**: 200 行（特殊情况需注释说明）

### 函数长度

- **目标**: 每个函数不超过 30 行
- **最大**: 50 行

### 行长度

- **最大**: 100 字符
- **推荐**: 80 字符

## 模块设计原则

### 单一职责

每个模块只做一件事：

```javascript
// storage.js - 只负责数据存储
// tracker.js - 只负责追踪逻辑
// events.js - 只负责事件处理
```

### 高内聚低耦合

- 相关功能放在同一模块
- 模块间通过明确接口通信
- 避免直接访问其他模块内部状态

### 依赖管理

```javascript
// 在模块顶部声明依赖
const Utils = global.TabTraceUtils;
const Storage = global.TabTraceStorage;
```

## 代码审查清单

### 提交前检查

- [ ] 文件长度不超过 150 行
- [ ] 函数长度不超过 30 行
- [ ] 使用中文注释
- [ ] 遵循命名规范
- [ ] 无 console.log（保留 console.error）
- [ ] 错误已处理

### 模块审查

- [ ] 职责单一
- [ ] 依赖关系清晰
- [ ] 接口明确
- [ ] 有适当的注释

## 示例代码

### 好的示例

```javascript
(function(global) {
  'use strict';

  const Utils = global.TabTraceUtils;

  const MyModule = {
    /**
     * 计算总时间
     * @param {Object} stats - 统计数据
     * @returns {number} 总秒数
     */
    calculateTotal: function(stats) {
      if (!stats || !stats.domains) {
        return 0;
      }

      return Object.values(stats.domains)
        .reduce(function(sum, time) {
          return sum + time;
        }, 0);
    },

    /**
     * 格式化并显示时间
     * @param {number} seconds - 秒数
     */
    displayTime: function(seconds) {
      const formatted = Utils.formatTime(seconds);
      const element = document.getElementById('time');
      if (element) {
        element.textContent = formatted;
      }
    }
  };

  global.TabTraceMyModule = MyModule;

})(window);
```

### 避免的代码

```javascript
// 避免：文件过大，职责混杂
function everything() {
  // 存储逻辑
  // 追踪逻辑
  // UI 更新
  // 事件处理
}

// 避免：无注释
function x(a, b) {
  return a + b;
}

// 避免：命名不清晰
const d = new Date();
const x = 123;
```
