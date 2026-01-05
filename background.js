/*!
 * Stock Preview Helper
 * ----------------------------------------
 * Copyright (c) 2026 Takehiko OGASAWARA
 * Released under the MIT License
 *
 * Description:
 *  - Hover stock symbol to preview TradingView chart
 *  - Draggable & resizable preview window
 *
 * Author: Takehiko OGASAWARA
 * Version: 0.1
 * Last Updated: 2026-01-06
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "mark-stocks",
    title: "米国銘柄をマーキング",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "mark-stocks") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  }
});