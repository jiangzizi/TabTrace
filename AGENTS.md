# TabTrace Architecture Overview

## Project Overview

TabTrace is a lightweight Chrome extension (Manifest V3) that tracks browsing time and displays usage statistics. It monitors active tab duration in real-time and provides daily browsing insights.

**Architecture Pattern**: Event-driven Service Worker + Popup UI

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension APIs                     │
├─────────────────────────────────────────────────────────────┤
│  src/background/ (Service Worker)                            │
│  ├── index.js        - Entry point, initialization          │
│  ├── storage.js      - Data persistence layer               │
│  ├── tracker.js      - Tab tracking core logic              │
│  └── events.js       - Chrome event handlers                │
├─────────────────────────────────────────────────────────────┤
│  src/popup/ (UI)                                             │
│  ├── index.js        - Popup entry point                    │
│  ├── mainPage.js     - Main page logic                      │
│  ├── historyPage.js  - History page logic                   │
│  └── styles/                                               │
│       ├── base.css   - Base styles & variables              │
│       ├── components.css - Reusable components              │
│       └── pages.css  - Page-specific styles                 │
├─────────────────────────────────────────────────────────────┤
│  src/shared/                                                 │
│  └── utils.js        - Shared utility functions             │
└─────────────────────────────────────────────────────────────┘
```

## Build & Commands

No build process required. This is a pure vanilla JS extension using IIFE modules.

**Installation**:
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select the project folder

**Development**: Edit files directly, then reload the extension in Chrome.

**Testing**: Manual testing via Chrome extension reload. No automated tests.

## Code Architecture

### Directory Structure

```
TabTrace/
├── manifest.json              # Extension configuration
├── popup.html                 # Popup HTML entry
├── src/
│   ├── background/            # Service Worker modules
│   │   ├── index.js           # Entry point (~40 lines)
│   │   ├── storage.js         # Storage manager (~140 lines)
│   │   ├── tracker.js         # Tab tracker (~130 lines)
│   │   └── events.js          # Event handlers (~80 lines)
│   ├── popup/                 # Popup UI modules
│   │   ├── index.js           # Entry point (~80 lines)
│   │   ├── mainPage.js        # Main page logic (~160 lines)
│   │   ├── historyPage.js     # History page logic (~140 lines)
│   │   └── styles/
│   │       ├── base.css       # Base styles (~80 lines)
│   │       ├── components.css # Component styles (~400 lines)
│   │       └── pages.css      # Page styles (~100 lines)
│   └── shared/                # Shared modules
│       └── utils.js           # Utility functions (~110 lines)
```

### Module System

We use **IIFE (Immediately Invoked Function Expression)** pattern for modularity without build tools:

```javascript
// Module definition
(function(global) {
  'use strict';

  const Module = {
    method: function() { /* ... */ }
  };

  // Export to global scope
  global.ModuleName = Module;

})(typeof window !== 'undefined' ? window : self);
```

**Benefits**:
- No build step required
- Clear dependency management via global namespace
- Works with Chrome Extension Manifest V3
- Each file has single responsibility

### Data Storage (chrome.storage.local)

Two data structures:

```javascript
// tabStats - Per-URL statistics
{
  "https://example.com": {
    domain: "example.com",
    title: "Page Title",
    totalTime: 120,      // seconds
    visitCount: 5,
    lastVisit: 1711449600000
  }
}

// dailyStats - Daily aggregated data
{
  "2024-03-26": {
    totalTime: 3600,     // seconds
    domains: {
      "example.com": 1800,
      "github.com": 1200
    }
  }
}
```

### Key Modules

**Background (Service Worker)**:

| Module | Purpose | Key Methods |
|--------|---------|-------------|
| `storage.js` | Data persistence | `init()`, `getAll()`, `save()`, `updateStats()` |
| `tracker.js` | Tab tracking logic | `start()`, `pause()`, `resume()`, `updateTitle()` |
| `events.js` | Chrome event handling | `handleTabActivated()`, `handleTabUpdated()`, `register()` |

**Popup (UI)**:

| Module | Purpose | Key Methods |
|--------|---------|-------------|
| `mainPage.js` | Main page display | `updateSitesList()`, `updateTotalTime()`, `updateCurrentTab()` |
| `historyPage.js` | History page display | `show()`, `hide()`, `loadData()`, `switchPeriod()` |

**Shared**:

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `utils.js` | Common utilities | `getTodayKey()`, `extractDomain()`, `formatTime()`, `getDateRange()` |

### Event Listeners (src/background/events.js)

- `chrome.tabs.onActivated` - Tab switch
- `chrome.tabs.onUpdated` - URL/title change in active tab
- `chrome.windows.onFocusChanged` - Window focus/blur
- `chrome.runtime.onInstalled` - Extension install
- `chrome.runtime.onStartup` - Browser startup

## Code Style

- **Language**: Vanilla JavaScript (ES6+ where supported by Chrome)
- **Comments**: Chinese comments in source files
- **Naming**: camelCase for functions/variables
- **Formatting**: No formatter configured
- **Async**: Uses async/await and Promises
- **Module Pattern**: IIFE with global namespace export

## Configuration

### manifest.json Permissions

```json
"permissions": ["storage", "tabs", "activeTab"]
```

- `storage` - Persist browsing statistics
- `tabs` - Query tab URLs and titles
- `activeTab` - Access active tab info

### Excluded URLs

The extension ignores:
- `chrome://` URLs (internal Chrome pages)

### Time Threshold

- Maximum interval for tracking: 3600 seconds (1 hour) - prevents abnormal time gaps

## Security Considerations

1. **Data Privacy**: All data stored locally in `chrome.storage.local`, no external transmission
2. **Favicon Loading**: Uses Google's favicon API (`www.google.com/s2/favicons`) - external network request
3. **No Authentication**: No user auth required, all data is local
4. **Content Security**: No external scripts loaded, inline SVG icons only

### Time Handling

**Beijing Time (UTC+8)**: All date calculations use Beijing time as the standard. The implementation uses `toLocaleString` with `timeZone: "Asia/Shanghai"` for accurate timezone conversion:

```javascript
// 获取今日日期字符串（以北京时间为准）
function getTodayKey() {
  const now = new Date();
  // 使用北京时间 (UTC+8)
  const beijingTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  return `${beijingTime.getFullYear()}-${String(beijingTime.getMonth() + 1).padStart(2, '0')}-${String(beijingTime.getDate()).padStart(2, '0')}`;
}
```

This approach is more reliable than manually adding 8 hours, as it properly handles timezone rules including daylight saving time transitions.

## Extension Behavior Notes

1. **Service Worker Lifecycle**: MV3 service worker may be terminated. The extension re-initializes tracking on browser startup and extension install.

2. **Window Focus**: Tracking pauses when Chrome loses focus (`WINDOW_ID_NONE`)

3. **Real-time Updates**: Popup refreshes current tab time every second while open

4. **Daily Reset**: Statistics are keyed by date string (`YYYY-MM-DD`), naturally resetting daily

## Documentation Structure

```
docs/
├── changes/        # Change logs for each commit
├── features/       # Feature documentation
└── architecture/   # Architecture decisions and notes
```

**Guidelines**:
- Document what was changed
- Document why it was changed
- Include important implementation details
- Note any breaking changes
