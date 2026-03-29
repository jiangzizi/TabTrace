// Main Page Module
// 处理主页面数据展示和交互

(function(global) {
  'use strict';

  const Utils = global.TabTraceUtils;
  const TOP_SITES_COUNT = 5;
  let isExpanded = false;

  const MainPage = {
    /**
     * 更新网站排行列表
     */
    updateSitesList: function() {
      const self = this;
      chrome.storage.local.get(['tabStats', 'dailyStats'], function(result) {
        const tabStats = result.tabStats || {};
        const dailyStats = result.dailyStats || {};
        const todayKey = Utils.getTodayKey();
        const todayData = dailyStats[todayKey] || { totalTime: 0, domains: {} };

        const sitesListEl = document.getElementById('sitesList');
        if (!sitesListEl) return;

        const sortedDomains = Object.entries(todayData.domains || {})
          .sort(function(a, b) { return b[1] - a[1]; });

        if (sortedDomains.length === 0) {
          sitesListEl.innerHTML = '<div class="empty-state">No data yet</div>';
          self._updateExpandButton(0);
          return;
        }

        const maxTime = sortedDomains[0][1];
        const displayCount = isExpanded ? sortedDomains.length : TOP_SITES_COUNT;
        const displayDomains = sortedDomains.slice(0, displayCount);

        sitesListEl.innerHTML = displayDomains.map(function(item, index) {
          const domain = item[0];
          const time = item[1];
          const percentage = Math.round((time / maxTime) * 100);
          const timeStr = Utils.formatTimeShort(time);
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

        const domainCount = Object.keys(tabStats).length;
        const visitCountEl = document.getElementById('visitCount');
        if (visitCountEl) {
          visitCountEl.textContent = `${domainCount} sites visited`;
        }

        self._updateExpandButton(sortedDomains.length);
      });
    },

    /**
     * 更新展开按钮状态
     * @private
     */
    _updateExpandButton: function(totalCount) {
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
    },

    /**
     * 切换展开状态
     */
    toggleExpand: function() {
      isExpanded = !isExpanded;
      const sitesList = document.getElementById('sitesList');
      if (sitesList) {
        sitesList.classList.toggle('expanded', isExpanded);
      }
      MainPage.updateSitesList();
    },

    /**
     * 更新今日总时长
     */
    updateTotalTime: function() {
      chrome.storage.local.get(['dailyStats'], function(result) {
        const dailyStats = result.dailyStats || {};
        const todayKey = Utils.getTodayKey();
        const todayData = dailyStats[todayKey] || { totalTime: 0 };

        const totalTimeEl = document.getElementById('totalTime');
        if (totalTimeEl) {
          totalTimeEl.textContent = Utils.formatTime(todayData.totalTime);
        }
      });
    },

    /**
     * 更新当前活跃 tab 信息
     */
    updateCurrentTab: async function() {
      try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab && activeTab.url && !activeTab.url.startsWith('chrome://')) {
          const currentDomainEl = document.getElementById('currentDomain');
          const currentTimeEl = document.getElementById('currentTime');

          let hostname;
          try {
            hostname = new URL(activeTab.url).hostname;
          } catch {
            hostname = activeTab.url;
          }

          const displayHostname = hostname.replace(/^www\./, '');
          if (currentDomainEl && currentDomainEl.textContent !== displayHostname) {
            currentDomainEl.textContent = displayHostname;
          }

          chrome.storage.local.get(['dailyStats'], function(result) {
            const dailyStats = result.dailyStats || {};
            const todayKey = Utils.getTodayKey();
            const todayData = dailyStats[todayKey] || { domains: {} };
            const currentTime = todayData.domains[hostname] || 0;

            if (currentTimeEl) {
              currentTimeEl.textContent = Utils.formatTimeShort(currentTime);
            }
          });
        }
      } catch (error) {
        console.error('Error updating current tab:', error);
      }
    }
  };

  // 导出到全局
  global.TabTraceMainPage = MainPage;

})(window);
