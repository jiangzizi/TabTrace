# TabTrace

> 📖 Also available in [English version](README.md)

一款轻量级的 Chrome 扩展，用于追踪你的浏览时长并展示全面的使用统计。

<img src="assets/demo.png" width="200" alt="TabTrace 演示">

## 功能特点

- **今日浏览时长** - 实时查看今天花了多少时间浏览网页
- **网站排行** - 按时间排序展示你访问最多的网站，配有可视化进度条
- **当前标签页追踪** - 实时追踪你正在访问的标签页，时长实时更新
- **可展开的网站列表** - 默认显示前 5 个网站，支持展开查看所有访问过的网站
- **历史数据** - 按周、月、年查看浏览历史及聚合统计数据
- **网站图标展示** - 通过 Google Favicon API 为每个网站显示精美的图标
- **本地数据存储** - 所有数据保存在 Chrome 本地，不会外传
- **北京时间标准** - 所有日期计算均以北京时间（UTC+8）为准

## 安装步骤

1. 克隆此仓库
2. 打开 `chrome://extensions/`
3. 开启右上角的 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择 `TabTrace` 文件夹

## 使用方法

安装后，点击 Chrome 工具栏中的 TabTrace 图标即可查看：

### 主页面
- 今日总浏览时长（实时更新）
- 按浏览时长排序的网站排行，配有可视化进度条
- 可展开查看所有访问过的网站
- 当前活跃标签页及其实时时长

### 历史页面
- 点击时钟图标进入历史数据页面
- 可在 周 / 月 / 年 视图间切换
- 查看每个时间段的总时长和网站排行

所有数据均存储在 Chrome 本地存储中，不会离开你的设备。

## 项目结构

```
TabTrace/
├── manifest.json     # 扩展配置文件
├── background.js     # 后台服务脚本，负责追踪
├── popup.html        # 弹窗界面结构
├── popup.css         # 弹窗样式
├── popup.js          # 弹窗逻辑和数据展示
├── icons/            # 扩展图标
└── assets/           # 演示截图
```

## 技术栈

- 原生 HTML/CSS/JS
- Chrome 扩展 API (Manifest V3)
- Google Favicon API
- Chrome Storage API

## 隐私与安全

- 所有浏览数据保存在 `chrome.storage.local` 本地存储中
- 数据不会传输到外部服务器
- 仅向 Google 公共 API 发送 favicon 请求
- 无需用户认证

## 开源许可

MIT
