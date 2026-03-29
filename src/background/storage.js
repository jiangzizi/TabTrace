// Storage Manager
// 管理 Chrome Storage 数据读写

(function(global) {
  'use strict';

  const STORAGE_KEYS = {
    TAB_STATS: 'tabStats',
    DAILY_STATS: 'dailyStats'
  };

  const Utils = global.TabTraceUtils;

  const Storage = {
    KEYS: STORAGE_KEYS,

    /**
     * 初始化存储数据结构
     * @returns {Promise<void>}
     */
    init: function() {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.TAB_STATS, STORAGE_KEYS.DAILY_STATS], (result) => {
          const updates = {};
          if (!result.tabStats) {
            updates[STORAGE_KEYS.TAB_STATS] = {};
          }
          if (!result.dailyStats) {
            updates[STORAGE_KEYS.DAILY_STATS] = {};
          }
          if (Object.keys(updates).length > 0) {
            chrome.storage.local.set(updates);
          }
          resolve();
        });
      });
    },

    /**
     * 获取所有统计数据
     * @returns {Promise<{tabStats: Object, dailyStats: Object}>}
     */
    getAll: function() {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.TAB_STATS, STORAGE_KEYS.DAILY_STATS], (result) => {
          resolve({
            tabStats: result.tabStats || {},
            dailyStats: result.dailyStats || {}
          });
        });
      });
    },

    /**
     * 保存统计数据
     * @param {Object} tabStats - Tab 统计数据
     * @param {Object} dailyStats - 每日统计数据
     * @returns {Promise<void>}
     */
    save: function(tabStats, dailyStats) {
      return new Promise((resolve) => {
        chrome.storage.local.set({
          [STORAGE_KEYS.TAB_STATS]: tabStats,
          [STORAGE_KEYS.DAILY_STATS]: dailyStats
        }, resolve);
      });
    },

    /**
     * 更新统计数据
     * @param {string} url - 当前 URL
     * @param {string} title - 页面标题
     * @param {number} timeSpent - 花费时间（秒）
     * @returns {Promise<void>}
     */
    updateStats: async function(url, title, timeSpent) {
      if (timeSpent <= 0 || timeSpent >= 3600) return;

      const { tabStats, dailyStats } = await this.getAll();
      const todayKey = Utils.getTodayKey();
      const now = Date.now();
      const domain = Utils.extractDomain(url);

      // 更新 tabStats
      if (!tabStats[url]) {
        tabStats[url] = {
          domain: domain,
          title: title || domain,
          totalTime: 0,
          visitCount: 0,
          lastVisit: now
        };
      }
      tabStats[url].totalTime += timeSpent;
      tabStats[url].lastVisit = now;

      // 更新 dailyStats
      if (!dailyStats[todayKey]) {
        dailyStats[todayKey] = {
          totalTime: 0,
          domains: {}
        };
      }
      dailyStats[todayKey].totalTime += timeSpent;
      if (!dailyStats[todayKey].domains[domain]) {
        dailyStats[todayKey].domains[domain] = 0;
      }
      dailyStats[todayKey].domains[domain] += timeSpent;

      await this.save(tabStats, dailyStats);
    },

    /**
     * 获取今日统计数据
     * @returns {Promise<{totalTime: number, domains: Object}>}
     */
    getTodayStats: async function() {
      const { dailyStats } = await this.getAll();
      const todayKey = Utils.getTodayKey();
      return dailyStats[todayKey] || { totalTime: 0, domains: {} };
    },

    /**
     * 获取指定日期的统计数据
     * @param {string} dateKey - 日期字符串 YYYY-MM-DD
     * @returns {Promise<{totalTime: number, domains: Object}>}
     */
    getDateStats: async function(dateKey) {
      const { dailyStats } = await this.getAll();
      return dailyStats[dateKey] || { totalTime: 0, domains: {} };
    }
  };

  // 导出到全局
  global.TabTraceStorage = Storage;

})(typeof window !== 'undefined' ? window : self);
