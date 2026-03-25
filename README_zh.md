# TabTrace

> 📖 Also available in [English version](README.md)

一款轻量级的 Chrome 扩展，用于追踪你的浏览时长并展示热门网站排行。

## 功能特点

- **今日浏览时长** - 查看今天花了多少时间浏览网页
- **网站排行** - 按时间排序展示你访问最多的网站
- **当前标签页追踪** - 实时追踪你正在访问的标签页
- **网站图标展示** - 为每个网站显示精美的 favicon 图标

## 安装步骤

1. 克隆此仓库
2. 打开 `chrome://extensions/`
3. 开启右上角的 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择 `TabTrace` 文件夹

## 使用方法

安装后，点击 Chrome 工具栏中的 TabTrace 图标即可查看：
- 今日总浏览时长
- 浏览时长排名前 5 的网站
- 当前活跃标签页及其访问时长

数据存储在 Chrome 本地存储中。

## 项目结构

```
TabTrace/
├── manifest.json     # 扩展配置文件
├── background.js     # 后台服务脚本
├── popup.html        # 弹窗界面结构
├── popup.css         # 弹窗样式
├── popup.js          # 弹窗逻辑
└── icons/            # 扩展图标
```

## 技术栈

- 原生 HTML/CSS/JS
- Chrome 扩展 API
- Google Favicon API

## 开源许可

MIT
