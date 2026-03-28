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
 * Version: 0.4.0
 * Last Updated: 2026-03-28
 */

/**************
 * MarkUp stock-code
 **************/
function markDataSymbol() {
  let site_found = false;
  const SITE_CONFIGS = window.US_STOCK_MARKER.SITE_CONFIGS;
  for (const config of SITE_CONFIGS) {
    const elements = document.querySelectorAll(config.selector);
    if (elements.length === 0) continue;

    let found = false;
    for (const el of elements) {
      const code = config.getCode(el);
      if (!code) continue;

      const target = config.target(el);
      if (!target) continue;

      // 二重処理防止
      if (target.classList.contains("stock-marker")){
        found = true;
        continue;
      }

      target.classList.add("stock-marker");
      target.dataset.ticker = code;
      if (config.applyStyle) {
        config.applyStyle(target);
      } else {
        target.style.color = "#000000"; // 黒色 (ダークモード時に白色 vs 黄色(背景)のため指定)
        target.style.backgroundColor = "#fff3b0"; // 黄色
        target.style.fontWeight = "bold";
      }

      // CONFIGが合っているとみなして終了.
      found = true;
    }
    if (found){
      console.log("markDataSymbol ConfigSelector: " + config.name);
      site_found = true;
      break;
    }
  }

  // CONFIGが合っていないサイトの場合
  if(!site_found){
    console.log("markDataSymbol ConfigSelector: FallBackDetect");
    // FallBack処理 (最後は正規表現でマッチングさせる)
    fallbackDetect();
  }
}


/**************
* MarkUp stock-code fallback support (1)
 **************/
function fallbackDetect() {
  const elements = document.querySelectorAll("table *, div *");

  for (const el of elements) {
    if (el.dataset.stockMarked) continue;

    const text = el.textContent;
    if (!text) continue;

    const result = detectStockCode(text);
    if (!result) continue;
    console.debug("fallbackDetect TYPE:", result.type, "CODE:", result.code);

    el.dataset.stockMarked = "true";

    //銘柄コード部分をマーキング
    highlightStockCode(el, result.code);
  }
}


/**************
* MarkUp stock-code fallback support (2)
 **************/
function detectStockCode(text) {
  // 銘柄名+銘柄コードの場合の対応
  const t = text.replace(/\s+/g, " ").trim();

  // 日本株（部分一致）
  const jpMatch = t.match(/\b\d{3}[0-9A-Z]\b/);
  if (jpMatch) {
    return { type: "JP", code: jpMatch[0] };
  }

  // 米国株
  const usMatch = t.match(/\b[A-Z]{1,5}([.-][A-Z])?\b/);
  if (usMatch) {
    const code = usMatch[0];
    if (["USD", "ETF", "ADR", "PER", "EPS"].includes(code)) return null;
    return { type: "US", code };
  }
  return null;
}


/**************
* MarkUp stock-code fallback support (3)
 **************/
function highlightStockCode(el, code) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) {
    if (!node.nodeValue.includes(code)) continue;

    const span = document.createElement("span");
    span.textContent = code;
    span.style.backgroundColor = "#fff3b0";
    span.style.color = "#000000";
    span.style.fontWeight = "bold";
    span.dataset.ticker = code; //TradingView用
    span.classList.add("stock-marker"); //TradingView用

    const parts = node.nodeValue.split(code);
    const fragment = document.createDocumentFragment();

    parts.forEach((part, index) => {
      if (part) {
        fragment.appendChild(document.createTextNode(part));
      }
      if (index < parts.length - 1) {
        fragment.appendChild(span.cloneNode(true));
      }
    });
    node.parentNode.replaceChild(fragment, node);
  }
}


/**************
 * Preview UI (iframe)
 **************/
function createPreviewBox() {
  const state = window.US_STOCK_MARKER.contentState;
  // ページ推移してページ内にPreviewBoxが見えない場合はグローバル変数と差異が出るためリセットする.
  if (state.previewBox && !document.body.contains(state.previewBox)){
    state.previewBox = null;
    state.previewIframe = null;
  }
  if (state.previewBox) return;

  state.previewBox = document.createElement("div");
  state.previewBox.id = "stock-preview";
  state.previewBox.innerHTML = `
    <div class="header">
      <span class="title">TradingView (Daily)</span>
      <button class="close">×</button>
    </div>
    <iframe allowfullscreen></iframe>
    <div class="resize-handle"></div>
  `;

  document.body.appendChild(state.previewBox);
  state.previewIframe = state.previewBox.querySelector("iframe");
  state.previewBox.querySelector(".close").onclick = () => {
    state.previewBox.remove();
    state.previewBox = null;
    state.previewIframe = null;
  };

  enableDrag(state.previewBox);
  enableResize(state.previewBox);
  restorePreviewState(state.previewBox); // Position
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
function showPreview(ticker) {
  createPreviewBox();
  const state = window.US_STOCK_MARKER.contentState;
  if (state.currentTicker === ticker) return;
  state.currentTicker = ticker;
  state.previewIframe.src =
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
document.addEventListener("mouseenter", (e) => {
  const el = getClosestStockMarker(e.target);

  const state = window.US_STOCK_MARKER.contentState;
  if (state.hoverTimer) {
    clearTimeout(state.hoverTimer);
    state.hoverTimer = null;
  }

  if (!el) return;
  createPreviewBox(); // 先に生成
  state.hoverTimer = setTimeout(() => {
    showPreview(el.dataset.ticker);
  }, 120);
}, true);


/**************
 * iframe は「選択中は非表示」にする（超重要）
 **************/
document.addEventListener("mouseleave", (e) => {
  const el = getClosestStockMarker(e.target);
  if (!el) return;
  const state = window.US_STOCK_MARKER.contentState;
  clearTimeout(state.hoverTimer);
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
  const state = window.US_STOCK_MARKER.contentState;
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    if (state.previewBox) state.previewBox.style.display = "flex";
  } else {
    if (state.previewBox) state.previewBox.style.display = "none";
  }
});


/**************
 * Style
 **************/
function initStyle(){
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
}


/**************
 * initialize
 **************/
function initMarking() {
  initStyle();
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
    const state = window.US_STOCK_MARKER.contentState;
    if (state.previewBox) state.previewBox.remove();
    state.previewBox = null;
  });
