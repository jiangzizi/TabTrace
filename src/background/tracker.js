// Tab Tracker
// 负责追踪活跃 Tab 的核心逻辑

(function(global) {
  'use strict';

  const Utils = global.TabTraceUtils;
  const Storage = global.TabTraceStorage;

  // 当前活跃的 tab 信息
  let activeTabId = null;
  let activeTabUrl = null;
  let activeTabTitle = null;
  let lastActiveTime = null;
  let trackingInterval = null;

  const MAX_TIME_INTERVAL = 3600; // 最大时间间隔 1 小时

  /**
   * 计算并更新当前 tab 的统计
   */
  async function updateCurrentStats() {
    if (!activeTabId || !activeTabUrl) return;

    const now = Date.now();
    const timeSpent = lastActiveTime ? Math.floor((now - lastActiveTime) / 1000) : 0;

    if (timeSpent > 0 && timeSpent < MAX_TIME_INTERVAL) {
      await Storage.updateStats(activeTabUrl, activeTabTitle, timeSpent);
    }

    lastActiveTime = now;
  }

  const Tracker = {
    /**
     * 开始追踪指定 tab
     * @param {number} tabId - Tab ID
     * @param {string} url - Tab URL
     * @param {string} title - Tab 标题
     */
    start: async function(tabId, url, title) {
      // 先更新上一个 tab 的统计
      if (activeTabId) {
        await updateCurrentStats();
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
      trackingInterval = setInterval(updateCurrentStats, 1000);
    },

    /**
     * 更新当前 tab 的标题（不重启追踪）
     * @param {string} title - 新标题
     */
    updateTitle: function(title) {
      activeTabTitle = title;
    },

    /**
     * 停止追踪
     */
    stop: function() {
      if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
      }
    },

    /**
     * 暂停追踪（窗口失去焦点时）
     */
    pause: function() {
      if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
      }
    },

    /**
     * 恢复追踪（窗口获得焦点时）
     */
    resume: async function() {
      try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab && activeTab.id && activeTab.url && !activeTab.url.startsWith('chrome://')) {
          this.start(activeTab.id, activeTab.url, activeTab.title);
        }
      } catch (error) {
        console.error('TabTrace: Error resuming tracking', error);
      }
    },

    /**
     * 获取当前追踪状态
     * @returns {{tabId: number|null, url: string|null, title: string|null}}
     */
    getState: function() {
      return {
        tabId: activeTabId,
        url: activeTabUrl,
        title: activeTabTitle
      };
    },

    /**
     * 检查 URL 是否可追踪
     * @param {string} url - URL
     * @returns {boolean}
     */
    isTrackableUrl: function(url) {
      return url && !url.startsWith('chrome://');
    }
  };

  // 导出到全局
  global.TabTraceTracker = Tracker;

})(typeof window !== 'undefined' ? window : self);
