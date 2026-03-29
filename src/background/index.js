// Background Service Worker Entry Point
// 负责初始化并开始追踪

// 导入顺序很重要：Utils -> Storage -> Tracker -> Events
importScripts(
  '../shared/utils.js',
  'storage.js',
  'tracker.js',
  'events.js'
);

(function() {
  'use strict';

  const Storage = self.TabTraceStorage;
  const Tracker = self.TabTraceTracker;
  const Events = self.TabTraceEvents;

  /**
   * 初始化扩展
   */
  async function initialize() {
    await Storage.init();
    await Tracker.resume();
    Events.register();
  }

  // 扩展安装或更新时初始化
  chrome.runtime.onInstalled.addListener(function() {
    initialize();
  });

  // Service Worker 启动时初始化
  chrome.runtime.onStartup.addListener(function() {
    initialize();
  });

  // 立即初始化并开始追踪
  initialize();

})();
