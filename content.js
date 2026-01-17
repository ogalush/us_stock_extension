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

/**************
 * MarkUp stock-code
 **************/
function markDataSymbol() {
  document.querySelectorAll("tr[data-symbol]").forEach(tr => {
    const ticker = tr.dataset.symbol;
    if (!ticker) return;

    const td = tr.querySelector("td");
    if (!td) return;

    // 二重処理防止
    if (td.classList.contains("stock-marker")) return;

    td.classList.add("stock-marker");
    td.dataset.ticker = ticker;
    td.style.cursor = "text";
    td.style.backgroundColor = "#fff3b0"; // 薄い黄色
    td.style.fontWeight = "bold";
  });
}


/**************
 * Preview UI (iframe)
 **************/
let previewBox = null;
let previewIframe = null;

function createPreviewBox() {
  if (previewBox) return;

  previewBox = document.createElement("div");
  previewBox.id = "stock-preview";

  previewBox.innerHTML = `
    <div class="header">
      <span class="title">TradingView (Daily)</span>
      <button class="close">×</button>
    </div>
    <iframe allowfullscreen></iframe>
    <div class="resize-handle"></div>
  `;

  document.body.appendChild(previewBox);

  previewIframe = previewBox.querySelector("iframe");

  previewBox.querySelector(".close").onclick = () => {
    previewBox.remove();
    previewBox = null;
    previewIframe = null;
  };

  enableDrag(previewBox);
  enableResize(previewBox);
  restorePreviewState(previewBox); // Position
}


/**************
 * Drag for iframe window
 **************/
function enableDrag(box) {
  const header = box.querySelector(".header");
  let startX, startY, startLeft, startTop;

  header.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;

    const rect = box.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
  });

  function move(e) {
    box.style.left = startLeft + (e.clientX - startX) + "px";
    box.style.top  = startTop  + (e.clientY - startY) + "px";
  }

  function stop() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", stop);
    savePreviewState(box); // Keep Position
  }
}

/**************
 * Resize for iframe window
 **************/
function enableResize(box) {
  const handle = box.querySelector(".resize-handle");
  let startX, startY, startW, startH;

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;

    const rect = box.getBoundingClientRect();
    startW = rect.width;
    startH = rect.height;

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stop);
  });

  function resize(e) {
    box.style.width  = Math.max(320, startW + (e.clientX - startX)) + "px";
    box.style.height = Math.max(240, startH + (e.clientY - startY)) + "px";
  }

  function stop() {
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stop);
    savePreviewState(box); // Keep Position
  }
}


/**************
 * Show TradingView iframe
 **************/
let currentTicker = null;
function showPreview(ticker) {
  createPreviewBox();
  if (currentTicker === ticker) return;

  currentTicker = ticker;
  previewIframe.src =
    `https://s.tradingview.com/widgetembed/?symbol=${ticker}&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&theme=${getTheme()}&locale=ja`;
}

/**************
 * for copy & Paste stock-codes.
 **************/
function getClosestStockMarker(target) {
  if (target instanceof Element) {
    return target.closest(".stock-marker");
  }
  if (target.parentElement) {
    return target.parentElement.closest(".stock-marker");
  }
  return null;
}


/**************
 * MouceOver → TradingView iframe
 **************/
let hoverTimer = null;
document.addEventListener("mouseenter", (e) => {
  const el = getClosestStockMarker(e.target);
  if (!el) return;

  createPreviewBox(); // 先に生成
  hoverTimer = setTimeout(() => {
    showPreview(el.dataset.ticker);
  }, 300);
}, true);


/**************
 * iframe は「選択中は非表示」にする（超重要）
 **************/
document.addEventListener("mouseleave", (e) => {
  const el = getClosestStockMarker(e.target);
  if (!el) return;

  clearTimeout(hoverTimer);
}, true);


/**************
 * Keep Position for Preview UI (iframe)
 **************/
function savePreviewState(box) {
  const rect = box.getBoundingClientRect();
  chrome.storage.local.set({
    previewState: {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    }
  });
}
function restorePreviewState(box) {
  chrome.storage.local.get("previewState", (res) => {
    if (!res.previewState) return;
    const s = res.previewState;
    box.style.left = s.left + "px";
    box.style.top = s.top + "px";
    box.style.width = s.width + "px";
    box.style.height = s.height + "px";
  });
}

/**************
 * DarkMode対応
 **************/
function isDarkMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getTheme() {
  return isDarkMode() ? "dark" : "light";
}


document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    if (previewBox) previewBox.style.display = "flex";
  } else {
    if (previewBox) previewBox.style.display = "none";
  }
});

/**************
 * Style
 **************/
const style = document.createElement("style");
style.textContent = `
#stock-preview {
  position: fixed;
  top: 80px;
  left: 500px;
  width: 420px;
  height: 360px;
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 4px 16px rgba(0,0,0,.3);
  z-index: 999999;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

#stock-preview .header {
  height: 32px;
  background: #f5f5f5;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  font-size: 12px;
  user-select: none;
}

#stock-preview iframe {
  flex: 1;
  border: none;
}

#stock-preview .close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

#stock-preview .resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}

.stock-marker {
  user-select: text;
  cursor: text;
}
`;

// DarkMode対応
const dark = isDarkMode();
style.textContent += dark ? `
#stock-preview {
  background: #1e1e1e;
  border-color: #444;
  color: #ddd;
}
#stock-preview .header {
  background: #2b2b2b;
}
` : "";
document.head.appendChild(style);


/**************
 * initialize
 **************/
function initMarking() {
  markDataSymbol();
}

/**************
 * Main
 **************/
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMarking);
} else {
  initMarking();
}

// DarkMode対応
window.matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (previewBox) previewBox.remove();
    previewBox = null;
  });
