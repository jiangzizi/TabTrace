// Event Handlers
// 处理 Chrome 扩展事件监听

(function(global) {
  'use strict';

  const Tracker = global.TabTraceTracker;

  const Events = {
    /**
     * 处理 tab 激活事件
     * @param {Object} activeInfo - 激活信息
     */
    handleTabActivated: async function(activeInfo) {
      try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab && Tracker.isTrackableUrl(tab.url)) {
          await Tracker.start(tab.id, tab.url, tab.title);
        }
      } catch (error) {
        console.error('TabTrace: Error on tab activated', error);
      }
    },

    /**
     * 处理 tab 更新事件
     * @param {number} tabId - Tab ID
     * @param {Object} changeInfo - 变更信息
     * @param {Object} tab - Tab 对象
     * @param {number|null} currentActiveTabId - 当前活跃的 Tab ID
     */
    handleTabUpdated: async function(tabId, changeInfo, tab, currentActiveTabId) {
      if (tabId !== currentActiveTabId) return;

      if (changeInfo.url) {
        if (Tracker.isTrackableUrl(tab.url)) {
          await Tracker.start(tab.id, tab.url, tab.title);
        }
      } else if (changeInfo.title && !changeInfo.url) {
        Tracker.updateTitle(changeInfo.title);
      }
    },

    /**
     * 处理窗口焦点变化事件
     * @param {number} windowId - 窗口 ID
     */
    handleWindowFocusChanged: function(windowId) {
      if (windowId === chrome.windows.WINDOW_ID_NONE) {
        Tracker.pause();
      } else {
        Tracker.resume();
      }
    },

    /**
     * 注册所有事件监听器
     */
    register: function() {
      const self = this;

      // Tab 激活事件
      chrome.tabs.onActivated.addListener(function(activeInfo) {
        self.handleTabActivated(activeInfo);
      });

      // Tab 更新事件
      chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        self.handleTabUpdated(tabId, changeInfo, tab, Tracker.getState().tabId);
      });

      // 窗口焦点变化事件
      chrome.windows.onFocusChanged.addListener(function(windowId) {
        self.handleWindowFocusChanged(windowId);
      });
    }
  };

  // 导出到全局
  global.TabTraceEvents = Events;

})(typeof window !== 'undefined' ? window : self);
