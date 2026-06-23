import { isToolActive, onStateChange } from "./state.js";

const CURSOR_SIZE = 32;
const STYLE_ID = "tool-cursor-style";

const CURSOR_MAP = {
  hand: makeCursor("✋", 18, 4),
  water: makeCursor("💧", 15, 4),
  harvest: makeCursor("✂", 16, 4),
};

function makeCursor(symbol, hotspotX, hotspotY) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${CURSOR_SIZE}" height="${CURSOR_SIZE}" viewBox="0 0 ${CURSOR_SIZE} ${CURSOR_SIZE}">
      <rect width="${CURSOR_SIZE}" height="${CURSOR_SIZE}" fill="transparent"/>
      <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-size="20">${symbol}</text>
    </svg>
  `;
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  return `url("data:image/svg+xml,${encoded}") ${hotspotX} ${hotspotY}, auto`;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.tool-cursor-active,
    body.tool-cursor-active [data-farm-cell],
    body.tool-cursor-active [data-farm-cell] * {
      cursor: var(--tool-cursor, auto) !important;
    }

    body.tool-cursor-active input,
    body.tool-cursor-active textarea,
    body.tool-cursor-active select,
    body.tool-cursor-active [contenteditable="true"] {
      cursor: text !important;
    }
  `;
  document.head.appendChild(style);
}

function applyCursor() {
  ensureStyles();

  const cursor = isToolActive("water")
    ? CURSOR_MAP.water
    : isToolActive("harvest")
      ? CURSOR_MAP.harvest
      : isToolActive("hand")
        ? CURSOR_MAP.hand
        : "";

  document.documentElement.style.setProperty("--tool-cursor", cursor || "auto");
  document.body.classList.toggle("tool-cursor-active", Boolean(cursor));
}

export function mountToolCursor() {
  applyCursor();
  onStateChange(applyCursor);
}
