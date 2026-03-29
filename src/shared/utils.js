// Shared Utilities
// 共享工具函数

(function(global) {
  'use strict';

  const Utils = {
    /**
     * 获取今日日期字符串（以北京时间为准）
     * @returns {string} 格式: YYYY-MM-DD
     */
    getTodayKey: function() {
      const now = new Date();
      const beijingTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
      return `${beijingTime.getFullYear()}-${String(beijingTime.getMonth() + 1).padStart(2, '0')}-${String(beijingTime.getDate()).padStart(2, '0')}`;
    },

    /**
     * 从 URL 中提取域名
     * @param {string} url - 完整 URL
     * @returns {string} 域名或原始 URL
     */
    extractDomain: function(url) {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname;
      } catch {
        return url;
      }
    },

    /**
     * 格式化时间显示（长格式）
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间字符串
     */
    formatTime: function(seconds) {
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
    },

    /**
     * 格式化简短时间（用于列表）
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的短时间字符串
     */
    formatTimeShort: function(seconds) {
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
    },

    /**
     * 获取日期范围
     * @param {string} period - 时间段: 'week' | 'month' | 'year'
     * @returns {string[]} 日期字符串数组
     */
    getDateRange: function(period) {
      const dates = [];
      const today = new Date();
      const beijingToday = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));

      let days;
      switch (period) {
        case 'week':
          days = 7;
          break;
        case 'month':
          days = 30;
          break;
        case 'year':
          days = 365;
          break;
        default:
          days = 7;
      }

      for (let i = 0; i < days; i++) {
        const date = new Date(beijingToday);
        date.setDate(date.getDate() - i);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        dates.push(dateKey);
      }

      return dates;
    }
  };

  // 导出到全局
  global.TabTraceUtils = Utils;

})(typeof window !== 'undefined' ? window : self);
