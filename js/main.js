import { mountInventory } from "./inventory.js";
import { mountMarket } from "./market.js";
import { mountPlot } from "./plot.js";
import { mountTools } from "./tools.js";
import { moveWidget, onStateChange, state } from "./state.js";

const farmGrid = document.getElementById("farm-grid");
const statusRoot = document.getElementById("status");

function statusMarkup() {
  statusRoot.innerHTML = `<strong>Status:</strong> ${state.message}`;
}

function widgetFrame(widgetId, bodyHtml) {
  return `
    <article class="widget" data-widget-id="${widgetId}" draggable="true">
      ${bodyHtml}
    </article>
  `;
}

function renderWidgets() {
  const widgets = {
    "land-plots": "",
    warehouse: `
      <section class="widget-shell widget-dropzone" data-widget-id="warehouse">
        <div class="widget-header drag-handle" data-widget-handle="warehouse">
          <div class="widget-title">
            <strong>Warehouse</strong>
            <span>Harvest storage</span>
          </div>
          <div class="grab-hint">⋮⋮</div>
        </div>
        <div class="widget-body">
          <div class="warehouse-count">
            <div class="warehouse-icon">🏚️</div>
            <div>
              <strong>${state.warehouse.wheat} wheat</strong>
              <span>Harvested wheat goes here</span>
            </div>
          </div>
          <div class="row" style="margin-top:12px;">
            <span class="pill">🌾 Stored wheat: ${state.warehouse.wheat}</span>
            <span class="pill">🪙 Coins: ${state.coins}</span>
          </div>
        </div>
      </section>
    `,
    market: `<div id="market-mount"></div>`,
    tools: `<div id="tools-mount"></div>`,
  };

  farmGrid.innerHTML = state.layoutOrder
    .map((widgetId) => {
      if (widgetId === "land-plots") {
        return `<div id="land-plots-mount"></div>`;
      }
      return widgets[widgetId];
    })
    .join("");
}

function installLayoutDragHandlers() {
  farmGrid.addEventListener("dragstart", (event) => {
    const widget = event.target.closest("[data-widget-id]");
    if (!widget) {
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ kind: "widget", widgetId: widget.dataset.widgetId })
    );
  });

  farmGrid.addEventListener("dragover", (event) => {
    const target = event.target.closest("[data-widget-id]");
    if (!target) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    target.classList.add("drag-over");
  });

  farmGrid.addEventListener("dragleave", (event) => {
    const target = event.target.closest("[data-widget-id]");
    if (target) {
      target.classList.remove("drag-over");
    }
  });

  farmGrid.addEventListener("drop", (event) => {
    event.preventDefault();
    const target = event.target.closest("[data-widget-id]");
    const payload = safeParseDrag(event.dataTransfer.getData("text/plain"));
    if (!payload || payload.kind !== "widget" || !target) {
      return;
    }

    moveWidget(payload.widgetId, target.dataset.widgetId);
  });
}

function mountSections() {
  mountPlot(document.getElementById("land-plots-mount"));
  mountMarket(document.getElementById("market-mount"));
  mountTools(document.getElementById("tools-mount"));
  mountInventory(document.getElementById("market-mount"));
}

function safeParseDrag(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function render() {
  renderWidgets();
  installLayoutDragHandlers();
  mountSections();
  statusMarkup();
}

onStateChange(render);
render();
