// Popup Entry Point
// 初始化 popup 页面

(function() {
  'use strict';

  const MainPage = window.TabTraceMainPage;
  const HistoryPage = window.TabTraceHistoryPage;

  /**
   * 绑定所有事件监听器
   */
  function bindEventListeners() {
    // 展开按钮
    const expandBtn = document.getElementById('expandBtn');
    if (expandBtn) {
      expandBtn.addEventListener('click', function() {
        MainPage.toggleExpand();
      });
    }

    // 历史页面按钮
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
      historyBtn.addEventListener('click', function() {
        HistoryPage.show();
      });
    }

    // 返回按钮
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        HistoryPage.hide();
      });
    }

    // 时间段切换
    document.querySelectorAll('.history-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        HistoryPage.switchPeriod(tab.dataset.period);
      });
    });
  }

  /**
   * 初始化页面数据
   */
  function initializeData() {
    MainPage.updateSitesList();
    MainPage.updateTotalTime();
  }

  /**
   * 启动实时更新
   */
  function startRealtimeUpdates() {
    // 每秒更新一次当前 tab 的时长
    setInterval(function() {
      MainPage.updateCurrentTab();
    }, 1000);
  }

  /**
   * 初始化 popup
   */
  function initialize() {
    bindEventListeners();
    initializeData();
    startRealtimeUpdates();
  }

  // DOM 加载完成后初始化
  document.addEventListener('DOMContentLoaded', initialize);

})();
