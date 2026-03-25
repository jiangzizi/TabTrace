# TabTrace

> 📖 Also available in [中文版](README_zh.md)

A lightweight Chrome extension that tracks your browsing time and displays your top sites.

## Features

- **Today's browsing time** - See how much time you've spent browsing today
- **Top sites ranking** - View your most visited sites ranked by time spent
- **Current tab tracking** - Real-time tracking of your active tab
- **Favicon display** - Beautiful favicon icons for each site

## Installation

1. Clone this repository
2. Open `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `TabTrace` folder

## Usage

Once installed, click the TabTrace icon in your Chrome toolbar to view:
- Your total browsing time for today
- A ranking of your top 5 sites by time spent
- Currently active tab and its duration

Data is stored locally in Chrome storage.

## Project Structure

```
TabTrace/
├── manifest.json     # Extension configuration
├── background.js     # Background service worker
├── popup.html        # Popup UI structure
├── popup.css        # Popup styles
├── popup.js         # Popup logic
└── icons/           # Extension icons
```

## Tech Stack

- Vanilla HTML/CSS/JS
- Chrome Extension APIs
- Google Favicon API

## License

MIT
