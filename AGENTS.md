# TabTrace Architecture Overview

## Project Overview

TabTrace is a lightweight Chrome extension (Manifest V3) that tracks browsing time and displays usage statistics. It monitors active tab duration in real-time and provides daily browsing insights.

**Architecture Pattern**: Event-driven Service Worker + Popup UI

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension APIs                     │
├─────────────────────────────────────────────────────────────┤
│  background.js (Service Worker)                              │
│  - Listens to tab activation/update events                   │
│  - Tracks active tab time every second                       │
│  - Stores data to chrome.storage.local                       │
├─────────────────────────────────────────────────────────────┤
│  popup.js/html/css (UI)                                      │
│  - Displays today's total time                               │
│  - Shows top 5 sites by time                                 │
│  - Shows current active tab info                             │
└─────────────────────────────────────────────────────────────┘
```

## Build & Commands

No build process required. This is a pure vanilla JS extension.

**Installation**:
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select the project folder

**Development**: Edit files directly, then reload the extension in Chrome.

**Testing**: Manual testing via Chrome extension reload. No automated tests.

## Code Architecture

### Core Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension config: permissions, service worker, popup |
| `background.js` | Service worker handling tab tracking logic |
| `popup.js` | UI logic for displaying statistics |
| `popup.html` | Popup UI structure |
| `popup.css` | Styling with CSS variables for theming |

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

### Key Functions

**background.js**:
- `startTracking(tabId, url, title)` - Begin tracking a tab
- `updateStats()` - Persist time to storage (called every second)
- `trackCurrentTab()` - Query and track the active tab
- `extractDomain(url)` - Parse hostname from URL

**popup.js**:
- `updateSitesList()` - Load and render top 5 sites
- `updateTotalTime()` - Display today's total
- `updateCurrentTab()` - Show current active tab info (refreshes every second)

### Event Listeners (background.js)

- `chrome.tabs.onActivated` - Tab switch
- `chrome.tabs.onUpdated` - URL/title change in active tab
- `chrome.windows.onFocusChanged` - Window focus/blur
- `chrome.runtime.onInstalled` - Extension install
- `chrome.runtime.onStartup` - Browser startup

## Code Style

- **Language**: Vanilla JavaScript (ES6+)
- **Comments**: Chinese comments in source files
- **Naming**: camelCase for functions/variables
- **Formatting**: No formatter configured
- **Async**: Uses async/await and Promises

## Commit Guidelines

**Before every commit**, write documentation in `docs/` directory:

1. Create or update relevant documentation files describing the changes
2. Documentation should explain what was changed, why, and any important implementation details
3. Keep docs concise but informative for future reference

Example structure:
```
docs/
├── features/       # Feature documentation
├── changes/        # Change logs
└── setup/          # Setup and configuration notes
```

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
