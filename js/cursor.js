import { getProduct } from "./catalog.js";
import { onStateChange, state } from "./state.js";

const STYLE_ID = "farm-cursor-style";
let contextMenuBlocked = false;
let selectedSeedCursorElement = null;
let latestPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let selectedSeedCursorMounted = false;

const WATER_CURSOR = makeCursor(
  `<path d="M16 4C12 9 9 13 9 18a7 7 0 0 0 14 0c0-5-3-9-7-14Z" fill="#4f8bcb" stroke="#2f6597" stroke-width="1.5"/>`,
  16,
  5
);

const HARVEST_CURSOR = makeCursor(
  `<circle cx="10" cy="22" r="3" fill="none" stroke="#5f6570" stroke-width="2"/>
   <circle cx="20" cy="22" r="3" fill="none" stroke="#5f6570" stroke-width="2"/>
   <path d="M12 20 24 8M18 20 8 8" fill="none" stroke="#5f6570" stroke-width="2" stroke-linecap="round"/>`,
  16,
  8
);

function makeCursor(markup, hotspotX, hotspotY) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="transparent"/>
      ${markup}
    </svg>
  `;
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  return `url("data:image/svg+xml,${encoded}") ${hotspotX} ${hotspotY}, pointer`;
}

export function mountFarmCursors() {
  if (document.getElementById(STYLE_ID)) {
    blockBrowserContextMenu();
    mountSelectedSeedCursor();
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    [data-farm-cell][data-stage="planted"],
    [data-farm-cell][data-stage="planted"] * {
      cursor: ${WATER_CURSOR} !important;
    }

    [data-farm-cell][data-stage="mature"],
    [data-farm-cell][data-stage="mature"] * {
      cursor: ${HARVEST_CURSOR} !important;
    }

    .selected-seed-cursor {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 10000;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      max-width: 148px;
      padding: 5px 7px;
      border: 1px solid rgba(70, 115, 62, 0.24);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.94);
      color: #3f3547;
      box-shadow: 0 8px 22px rgba(63, 53, 71, 0.14);
      font: 700 0.68rem/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      pointer-events: none;
      transform: translate(12px, 12px);
    }

    .selected-seed-cursor__icon {
      font-size: 1rem;
      line-height: 1;
    }

    .selected-seed-cursor__name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    body.is-night .selected-seed-cursor {
      border-color: rgba(255, 255, 255, 0.45);
      background: rgba(14, 18, 31, 0.96);
      color: #fff;
    }
  `;
  document.head.appendChild(style);
  blockBrowserContextMenu();
  mountSelectedSeedCursor();
}

function mountSelectedSeedCursor() {
  if (selectedSeedCursorMounted) {
    renderSelectedSeedCursor();
    return;
  }

  selectedSeedCursorMounted = true;
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  onStateChange(renderSelectedSeedCursor);
  renderSelectedSeedCursor();
}

function handlePointerMove(event) {
  latestPointer = { x: event.clientX, y: event.clientY };
  positionSelectedSeedCursor();
}

function positionSelectedSeedCursor() {
  if (!selectedSeedCursorElement) {
    return;
  }

  selectedSeedCursorElement.style.left = `${latestPointer.x}px`;
  selectedSeedCursorElement.style.top = `${latestPointer.y}px`;
}

function renderSelectedSeedCursor() {
  const selectedProduct = getProduct(state.inventory.selectedItemId);
  if (!selectedProduct || selectedProduct.category !== "seeds") {
    if (selectedSeedCursorElement) {
      selectedSeedCursorElement.remove();
      selectedSeedCursorElement = null;
    }
    return;
  }

  if (!selectedSeedCursorElement) {
    selectedSeedCursorElement = document.createElement("div");
    selectedSeedCursorElement.className = "selected-seed-cursor";
    document.body.appendChild(selectedSeedCursorElement);
  }

  selectedSeedCursorElement.innerHTML = `
    <span class="selected-seed-cursor__icon" aria-hidden="true">${selectedProduct.icon || ""}</span>
    <span class="selected-seed-cursor__name">${selectedProduct.marketName || selectedProduct.inventoryName}</span>
  `;
  positionSelectedSeedCursor();
}

function blockBrowserContextMenu() {
  if (contextMenuBlocked) {
    return;
  }

  contextMenuBlocked = true;
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
}
