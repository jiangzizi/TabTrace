// TabTrace Background Service Worker
// 负责追踪活跃 tab 的访问时长

// 当前活跃的 tab 信息
let activeTabId = null;
let activeTabUrl = null;
let activeTabTitle = null;
let lastActiveTime = null;
let trackingInterval = null;

// 获取今日日期字符串
function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// 初始化存储数据结构
function initStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tabStats', 'dailyStats'], (result) => {
      if (!result.tabStats) {
        chrome.storage.local.set({ tabStats: {} });
      }
      if (!result.dailyStats) {
        chrome.storage.local.set({ dailyStats: {} });
      }
      resolve();
    });
  });
}

// 从 URL 中提取域名
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// 更新 tab 统计
function updateStats() {
  if (!activeTabId || !activeTabUrl) return;

  const now = Date.now();
  const timeSpent = lastActiveTime ? Math.floor((now - lastActiveTime) / 1000) : 0;

  if (timeSpent > 0 && timeSpent < 3600) { // 忽略异常大的时间间隔（超过1Hours）
    chrome.storage.local.get(['tabStats', 'dailyStats'], (result) => {
      const tabStats = result.tabStats || {};
      const dailyStats = result.dailyStats || {};
      const todayKey = getTodayKey();

      // 更新 tabStats
      if (!tabStats[activeTabUrl]) {
        tabStats[activeTabUrl] = {
          domain: extractDomain(activeTabUrl),
          title: activeTabTitle || extractDomain(activeTabUrl),
          totalTime: 0,
          visitCount: 0,
          lastVisit: now
        };
      }
      tabStats[activeTabUrl].totalTime += timeSpent;
      tabStats[activeTabUrl].lastVisit = now;

      // 更新 dailyStats
      if (!dailyStats[todayKey]) {
        dailyStats[todayKey] = {
          totalTime: 0,
          domains: {}
        };
      }
      dailyStats[todayKey].totalTime += timeSpent;
      const domain = extractDomain(activeTabUrl);
      if (!dailyStats[todayKey].domains[domain]) {
        dailyStats[todayKey].domains[domain] = 0;
      }
      dailyStats[todayKey].domains[domain] += timeSpent;

      chrome.storage.local.set({ tabStats, dailyStats });
    });
  }

  lastActiveTime = now;
}

// 开始追踪
function startTracking(tabId, url, title) {
  // 先更新上一个 tab 的统计
  if (activeTabId) {
    updateStats();
  }

  activeTabId = tabId;
  activeTabUrl = url;
  activeTabTitle = title;
  lastActiveTime = Date.now();

  // 清除之前的间隔
  if (trackingInterval) {
    clearInterval(trackingInterval);
  }

  // 每秒更新一次统计
  trackingInterval = setInterval(updateStats, 1000);
}

// 获取当前活跃 tab 并开始追踪
async function trackCurrentTab() {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.id && activeTab.url && !activeTab.url.startsWith('chrome://')) {
      startTracking(activeTab.id, activeTab.url, activeTab.title);
    }
  } catch (error) {
    console.error('TabTrace: Error tracking tab', error);
  }
}

// 监听 tab 激活事件
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.url && !tab.url.startsWith('chrome://')) {
      startTracking(tab.id, tab.url, tab.title);
    }
  } catch (error) {
    console.error('TabTrace: Error on tab activated', error);
  }
});

// 监听 tab 更新事件（URL 变化）
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    // URL 变化时，先更新统计，然后开始追踪新 URL
    if (activeTabUrl) {
      updateStats();
    }
    if (tab.url && !tab.url.startsWith('chrome://')) {
      startTracking(tab.id, tab.url, tab.title);
    }
  } else if (tabId === activeTabId && changeInfo.title && !changeInfo.url) {
    // 仅标题变化时更新
    activeTabTitle = changeInfo.title;
  }
});

// 监听窗口聚焦变化
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // 窗口失去焦点，暂停追踪
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
  } else {
    // 窗口获得焦点，重新追踪
    trackCurrentTab();
  }
});

// 扩展安装或更新时初始化
chrome.runtime.onInstalled.addListener(async () => {
  await initStorage();
  await trackCurrentTab();
});

// service worker 启动时初始化
chrome.runtime.onStartup.addListener(async () => {
  await initStorage();
  await trackCurrentTab();
});

// 立即初始化并开始追踪
initStorage().then(trackCurrentTab);