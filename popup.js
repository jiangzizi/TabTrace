// TabTrace Popup Script
// 处理 popup 界面的数据展示和交互

// 获取今日日期字符串
function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// 格式化时间显示
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds} 秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} Mins`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} Hours ${minutes} Mins`;
  }
}

// 格式化简短时间（用于列表）
function formatTimeShort(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// 更新网站排行（只在打开时加载一次，不监听实时变化）
let isExpanded = false;
const TOP_SITES_COUNT = 5;

function updateSitesList() {
  chrome.storage.local.get(['tabStats', 'dailyStats'], (result) => {
    const tabStats = result.tabStats || {};
    const dailyStats = result.dailyStats || {};
    const todayKey = getTodayKey();
    const todayData = dailyStats[todayKey] || { totalTime: 0, domains: {} };

    const sitesListEl = document.getElementById('sitesList');
    if (!sitesListEl) return;

    // 按今日时长排序
    const sortedDomains = Object.entries(todayData.domains || {})
      .sort((a, b) => b[1] - a[1]);

    if (sortedDomains.length === 0) {
      sitesListEl.innerHTML = '<div class="empty-state">No data yet</div>';
      updateExpandButton(0);
      return;
    }

    const maxTime = sortedDomains[0][1];
    // 根据展开状态决定显示数量
    const displayCount = isExpanded ? sortedDomains.length : TOP_SITES_COUNT;
    const displayDomains = sortedDomains.slice(0, displayCount);

    sitesListEl.innerHTML = displayDomains.map(([domain, time], index) => {
      const percentage = Math.round((time / maxTime) * 100);
      const timeStr = formatTimeShort(time);
      // 简化域名显示，去掉 www. 前缀
      const displayDomain = domain.replace(/^www\./, '');
      return `
        <div class="site-item">
          <span class="site-rank">${index + 1}</span>
          <img class="site-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32" alt="" loading="lazy" onerror="this.style.display='none'">
          <div class="site-info">
            <div class="site-domain" title="${domain}">${displayDomain}</div>
          </div>
          <div class="site-right">
            <span class="site-time">${timeStr}</span>
            <div class="site-bar">
              <div class="site-bar-fill" style="width: ${percentage}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 更新访问计数
    const domainCount = Object.keys(tabStats).length;
    const visitCountEl = document.getElementById('visitCount');
    if (visitCountEl) {
      visitCountEl.textContent = `${domainCount} sites visited`;
    }

    // 更新展开按钮状态
    updateExpandButton(sortedDomains.length);
  });
}

// 更新展开按钮状态
function updateExpandButton(totalCount) {
  const expandBtn = document.getElementById('expandBtn');
  const expandText = document.getElementById('expandText');
  if (!expandBtn || !expandText) return;

  if (totalCount <= TOP_SITES_COUNT) {
    expandBtn.style.display = 'none';
  } else {
    expandBtn.style.display = 'flex';
    expandText.textContent = isExpanded ? 'Show Less' : `Show All (${totalCount})`;
    expandBtn.setAttribute('aria-expanded', isExpanded);
  }
}

// 切换展开状态
function toggleExpand() {
  isExpanded = !isExpanded;
  const sitesList = document.getElementById('sitesList');
  if (sitesList) {
    sitesList.classList.toggle('expanded', isExpanded);
  }
  updateSitesList();
}

// 更新今日总时长
function updateTotalTime() {
  chrome.storage.local.get(['dailyStats'], (result) => {
    const dailyStats = result.dailyStats || {};
    const todayKey = getTodayKey();
    const todayData = dailyStats[todayKey] || { totalTime: 0 };

    const totalTimeEl = document.getElementById('totalTime');
    if (totalTimeEl) {
      totalTimeEl.textContent = formatTime(todayData.totalTime);
    }
  });
}

// 更新当前活跃 tab 信息（每秒刷新，不触发列表重排）
let lastActiveTabUrl = null;

async function updateCurrentTab() {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.url && !activeTab.url.startsWith('chrome://')) {
      const currentDomainEl = document.getElementById('currentDomain');
      const currentTimeEl = document.getElementById('currentTime');

      // 检测 tab 是否变化，变化时才更新域名显示
      const url = activeTab.url;
      let hostname;
      try {
        hostname = new URL(url).hostname;
      } catch {
        hostname = url;
      }

      if (currentDomainEl && currentDomainEl.textContent !== hostname) {
        currentDomainEl.textContent = hostname;
      }

      // 更新时长（每次都更新，因为这是实时数据）
      chrome.storage.local.get(['tabStats'], (result) => {
        const tabStats = result.tabStats || {};
        const currentTime = tabStats[url]?.totalTime || 0;

        if (currentTimeEl) {
          currentTimeEl.textContent = formatTimeShort(currentTime);
        }
      });
    }
  } catch (error) {
    console.error('Error updating current tab:', error);
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 只在打开时加载一次数据
  updateSitesList();
  updateTotalTime();

  // 绑定展开按钮事件
  const expandBtn = document.getElementById('expandBtn');
  if (expandBtn) {
    expandBtn.addEventListener('click', toggleExpand);
  }

  // 每秒更新一次当前 tab 的时长
  setInterval(updateCurrentTab, 1000);
});