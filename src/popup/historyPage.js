// History Page Module
// 处理历史数据页面展示和交互

(function(global) {
  'use strict';

  const Utils = global.TabTraceUtils;
  let currentPeriod = 'week';

  const HistoryPage = {
    /**
     * 显示历史页面
     */
    show: function() {
      const mainPage = document.getElementById('mainPage');
      const historyPage = document.getElementById('historyPage');

      if (mainPage && historyPage) {
        mainPage.classList.add('hidden');
        historyPage.classList.remove('hidden');
        this.loadData(currentPeriod);
      }
    },

    /**
     * 显示主页面
     */
    hide: function() {
      const mainPage = document.getElementById('mainPage');
      const historyPage = document.getElementById('historyPage');

      if (mainPage && historyPage) {
        historyPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
      }
    },

    /**
     * 加载历史数据
     * @param {string} period - 时间段: 'week' | 'month' | 'year'
     */
    loadData: function(period) {
      const self = this;
      chrome.storage.local.get(['dailyStats'], function(result) {
        const dailyStats = result.dailyStats || {};
        const dateRange = Utils.getDateRange(period);

        // 聚合数据
        const aggregatedDomains = {};
        let totalTime = 0;

        dateRange.forEach(function(dateKey) {
          const dayData = dailyStats[dateKey];
          if (dayData && dayData.domains) {
            totalTime += dayData.totalTime || 0;
            Object.entries(dayData.domains).forEach(function(entry) {
              const domain = entry[0];
              const time = entry[1];
              aggregatedDomains[domain] = (aggregatedDomains[domain] || 0) + time;
            });
          }
        });

        // 更新总时长
        const historyTotalTimeEl = document.getElementById('historyTotalTime');
        if (historyTotalTimeEl) {
          historyTotalTimeEl.textContent = Utils.formatTime(totalTime);
        }

        // 更新网站列表
        const historySitesListEl = document.getElementById('historySitesList');
        if (!historySitesListEl) return;

        const sortedDomains = Object.entries(aggregatedDomains)
          .sort(function(a, b) { return b[1] - a[1]; });

        if (sortedDomains.length === 0) {
          historySitesListEl.innerHTML = '<div class="empty-state">No data yet</div>';
          return;
        }

        const maxTime = sortedDomains[0][1];

        historySitesListEl.innerHTML = sortedDomains.map(function(item, index) {
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
      });
    },

    /**
     * 切换历史数据时间段
     * @param {string} period - 时间段: 'week' | 'month' | 'year'
     */
    switchPeriod: function(period) {
      currentPeriod = period;

      // 更新标签样式
      document.querySelectorAll('.history-tab').forEach(function(tab) {
        if (tab.dataset.period === period) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      this.loadData(period);
    },

    /**
     * 获取当前时间段
     * @returns {string}
     */
    getCurrentPeriod: function() {
      return currentPeriod;
    }
  };

  // 导出到全局
  global.TabTraceHistoryPage = HistoryPage;

})(window);
