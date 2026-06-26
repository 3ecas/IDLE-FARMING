import {
  getCellDragBounds,
  getPlotDisplayLabel,
  getPlotGrowthProgress,
  getPlotStatusLabel,
  getBarnItemQuantity,
  harvestPlot,
  moveFarmPlot,
  onProgressChange,
  onStateChange,
  plantSeedFromInventoryOnPlot,
  setMessage,
  state,
  waterPlot,
} from "./state.js";
import { getProduct, sortProductsByCoinValue } from "./catalog.js";
import { CROP_ITEMS } from "./seeds.js";
import { mountMovableCell, wasRecentlyDragged } from "./drag.js";

const SEED_PICKER_GAP = 8;
const SEED_PICKER_WIDTH = 172;
const SEED_PICKER_MAX_HEIGHT = 220;
const PLOT_TOOLTIP_DELAY_MS = 1500;
const PLOT_TOOLTIP_OFFSET = 14;
const PLOT_TOOLTIP_WIDTH = 178;
const PLOT_TOOLTIP_HEIGHT = 132;

let activeSeedPickerPlotId = null;

function formatRemainingTime(ms) {
  const seconds = Math.max(0, Math.ceil((Number(ms) || 0) / 1000));
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

function formatProductName(productId) {
  const product = getProduct(productId);
  return product?.marketName || product?.inventoryName || "Item";
}

function getHarvestDropText(plot) {
  const plantedProduct = getProduct(plot?.cropId);
  const harvestProductId = plantedProduct?.cropProductId || plot?.cropId;
  const cropProduct = getProduct(harvestProductId);
  if (!cropProduct) {
    return "-";
  }

  const drops = [];
  const harvestQuantity = Number.isFinite(cropProduct.harvestYield) ? cropProduct.harvestYield : 1;
  drops.push(`${harvestQuantity} ${cropProduct.marketName || cropProduct.inventoryName || "Crop"}`);

  if (cropProduct.harvestDrops && typeof cropProduct.harvestDrops === "object") {
    for (const [productId, quantity] of Object.entries(cropProduct.harvestDrops)) {
      drops.push(`${quantity} ${formatProductName(productId)}`);
    }
  }

  return drops.join(", ");
}

function getPlotTooltipRows(plot) {
  if (!plot?.cropId) {
    return [{ label: "State", value: "Plant seed" }];
  }

  if (plot.stage === "planted") {
    return [{ label: "State", value: "Needs water" }];
  }

  if (plot.stage === "growing") {
    return [
      { label: "State", value: "Growing" },
      { label: "Harvest in", value: formatRemainingTime((plot.growCompleteAt || Date.now()) - Date.now()) },
    ];
  }

  if (plot.stage === "mature") {
    return [
      { label: "State", value: "Ready to harvest" },
      { label: "Drop", value: getHarvestDropText(plot) },
    ];
  }

  return [{ label: "State", value: "Plant seed" }];
}

function getPlotTooltipContent(plot) {
  const title = getPlotDisplayLabel(plot) || "Farm Plot";
  const rows = getPlotTooltipRows(plot)
    .map((row) => `
      <div class="seed-info-tooltip__row plot-info-tooltip__row">
        <span>${row.label}</span>
        <strong>${row.value}</strong>
      </div>
    `)
    .join("");

  return `
    <div class="seed-info-tooltip__title">${title}</div>
    ${rows}
  `;
}

function getPlotTooltipPosition(event) {
  return {
    left: Math.min(window.innerWidth - PLOT_TOOLTIP_WIDTH - 8, Math.max(8, event.clientX + PLOT_TOOLTIP_OFFSET)),
    top: Math.min(window.innerHeight - PLOT_TOOLTIP_HEIGHT - 8, Math.max(8, event.clientY + PLOT_TOOLTIP_OFFSET)),
  };
}

function clampToWorkspace(workspace, left, top) {
  const bounds = getCellDragBounds("farm");
  const maxLeft = Math.max(0, workspace.clientWidth - bounds.width);
  const maxTop = Math.max(0, workspace.clientHeight - bounds.height);

  return {
    left: Math.min(maxLeft, Math.max(0, left)),
    top: Math.min(maxTop, Math.max(0, top)),
  };
}

function getPlotGlyph(plot) {
  if (plot.stage === "mature") {
    return "🌾";
  }

  if (plot.stage === "growing") {
    return "🌱";
  }

  return "";
}

function getAvailableSeedEntries() {
  return CROP_ITEMS
    .map(({ seed }) => {
      const quantity = getBarnItemQuantity(seed.id);
      return quantity > 0 ? { seed, quantity } : null;
    })
    .filter(Boolean)
    .sort((first, second) => sortProductsByCoinValue(first.seed, second.seed));
}

function getSeedPickerPosition(workspace, plot) {
  const position = clampToWorkspace(workspace, plot.left, plot.top);
  const workspaceWidth = workspace?.clientWidth || window.innerWidth;
  const workspaceHeight = workspace?.clientHeight || window.innerHeight;
  const opensRight = position.left + 72 + SEED_PICKER_GAP + SEED_PICKER_WIDTH <= workspaceWidth - 12;
  const left = opensRight
    ? position.left + 72 + SEED_PICKER_GAP
    : Math.max(12, position.left - SEED_PICKER_WIDTH - SEED_PICKER_GAP);
  const top = Math.max(12, Math.min(position.top, workspaceHeight - SEED_PICKER_MAX_HEIGHT - 12));

  return { left, top };
}

function closeSeedPicker() {
  if (!activeSeedPickerPlotId) {
    return;
  }

  activeSeedPickerPlotId = null;
}

export function mountPlot(container) {
  let hoveredPlotId = null;
  let latestTooltipEvent = null;
  let plotTooltipElement = null;
  let plotTooltipTimer = null;
  let isPlotTooltipReady = false;

  function hidePlotTooltip() {
    hoveredPlotId = null;
    latestTooltipEvent = null;
    isPlotTooltipReady = false;
    if (plotTooltipTimer) {
      window.clearTimeout(plotTooltipTimer);
      plotTooltipTimer = null;
    }
    if (plotTooltipElement) {
      plotTooltipElement.remove();
      plotTooltipElement = null;
    }
  }

  function updatePlotTooltip(event = latestTooltipEvent) {
    if (!hoveredPlotId || !event || !isPlotTooltipReady) {
      return;
    }

    const plot = state.farm.plots.find((entry) => entry.id === hoveredPlotId);
    if (!plot) {
      hidePlotTooltip();
      return;
    }

    latestTooltipEvent = event;
    if (!plotTooltipElement) {
      plotTooltipElement = document.createElement("div");
      plotTooltipElement.className = "seed-info-tooltip plot-info-tooltip";
      plotTooltipElement.setAttribute("role", "tooltip");
      document.body.appendChild(plotTooltipElement);
    }

    const position = getPlotTooltipPosition(event);
    plotTooltipElement.innerHTML = getPlotTooltipContent(plot);
    plotTooltipElement.style.left = `${position.left}px`;
    plotTooltipElement.style.top = `${position.top}px`;
  }

  function showPlotTooltip(event) {
    const cell = event.target.closest("[data-farm-cell]");
    if (!cell) {
      return;
    }

    hoveredPlotId = cell.dataset.cellKey;
    latestTooltipEvent = event;
    isPlotTooltipReady = false;
    if (plotTooltipTimer) {
      window.clearTimeout(plotTooltipTimer);
    }
    plotTooltipTimer = window.setTimeout(() => {
      plotTooltipTimer = null;
      isPlotTooltipReady = true;
      updatePlotTooltip();
    }, PLOT_TOOLTIP_DELAY_MS);
  }

  function movePlotTooltip(event) {
    if (!hoveredPlotId) {
      return;
    }

    latestTooltipEvent = event;
    updatePlotTooltip(event);
  }

  function leavePlotTooltip(event) {
    const cell = event.target.closest("[data-farm-cell]");
    if (!cell || cell.contains(event.relatedTarget)) {
      return;
    }

    hidePlotTooltip();
  }

  mountMovableCell(container, {
    key: "farm-plot",
    selector: "[data-farm-cell]",
    onDrop: (dragSnapshot, finalPosition) => {
      moveFarmPlot(dragSnapshot.key, finalPosition.left, finalPosition.top);
      return true;
    },
  });

  container.addEventListener("pointerover", showPlotTooltip);
  container.addEventListener("pointermove", movePlotTooltip);
  container.addEventListener("pointerout", leavePlotTooltip);

  container.addEventListener("click", (event) => {
    const seedButton = event.target.closest("[data-seed-choice]");
    if (seedButton) {
      event.preventDefault();
      event.stopPropagation();
      const planted = plantSeedFromInventoryOnPlot(seedButton.dataset.seedPlotId, seedButton.dataset.seedChoice);
      activeSeedPickerPlotId = null;
      if (!planted) {
        render();
      }
      return;
    }

    const cell = event.target.closest("[data-farm-cell]");
    if (!cell || wasRecentlyDragged(cell.dataset.cellKey)) {
      closeSeedPicker();
      render();
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const plotId = cell.dataset.cellKey;
    const plot = state.farm.plots.find((entry) => entry.id === plotId);
    if (!plot) {
      return;
    }

    if (plot.stage === "planted") {
      closeSeedPicker();
      waterPlot(plotId);
      return;
    }

    if (plot.stage === "mature") {
      closeSeedPicker();
      harvestPlot(plotId);
      return;
    }

    if (plot.cropId) {
      closeSeedPicker();
      setMessage("Still growing.");
      return;
    }

    if (state.inventory.selectedItemId) {
      closeSeedPicker();
      plantSeedFromInventoryOnPlot(plotId, state.inventory.selectedItemId);
      return;
    }

    activeSeedPickerPlotId = activeSeedPickerPlotId === plotId ? null : plotId;
    render();
  });

  container.addEventListener("contextmenu", (event) => {
    const cell = event.target.closest("[data-farm-cell]");
    if (!cell) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const plot = state.farm.plots.find((entry) => entry.id === cell.dataset.cellKey);
    if (!plot || !plot.cropId) {
      return;
    }

    closeSeedPicker();
    if (plot.stage === "planted" || plot.stage === "growing") {
      harvestPlot(plot.id);
      return;
    }

    setMessage("Ready to harvest.");
  });

  function render() {
    const workspace = container.closest(".workspace");
    const seedPickerPlot = state.farm.plots.find((plot) => plot.id === activeSeedPickerPlotId && !plot.cropId) || null;
    if (activeSeedPickerPlotId && !seedPickerPlot) {
      activeSeedPickerPlotId = null;
    }
    const seedEntries = getAvailableSeedEntries();

    container.innerHTML = `
      ${state.farm.plots
        .map((plot) => {
          const position = clampToWorkspace(workspace, plot.left, plot.top);
          const isEntering = state.farm.enteringPlotIds.includes(plot.id);
          const stage = plot.stage || "empty";
          const nameLabel = getPlotDisplayLabel(plot);
          const statusLabel = getPlotStatusLabel(plot);
          const growthProgress = getPlotGrowthProgress(plot);
          const statusText = stage === "growing" ? `${statusLabel} ${growthProgress}%` : statusLabel;
          const ariaLabel = nameLabel ? `Land plot, ${nameLabel}` : "Land plot";

          return `
            <button
              type="button"
              class="farm-cell farm-cell--${stage} ${isEntering ? "is-entering" : ""}"
              data-cell-key="${plot.id}"
              data-farm-cell
              style="left:${position.left}px; top:${position.top}px;"
              aria-label="${ariaLabel}"
              data-stage="${stage}"
            >
              <span class="farm-cell__glyph">${getPlotGlyph(plot)}</span>
              ${statusText ? `<span class="farm-cell__status farm-cell__status--${stage}">${statusText}</span>` : ""}
              ${
                stage === "growing"
                  ? `
                    <span class="farm-cell__progress" aria-hidden="true">
                      <span class="farm-cell__progress-fill" style="width:${growthProgress}%"></span>
                    </span>
                  `
                  : ""
              }
              ${nameLabel ? `<span class="farm-cell__label">${nameLabel}</span>` : ""}
            </button>
          `;
        })
        .join("")}
      ${
        seedPickerPlot
          ? (() => {
              const pickerPosition = getSeedPickerPosition(workspace, seedPickerPlot);
              return `
                <div
                  class="seed-picker"
                  data-seed-picker
                  style="left:${pickerPosition.left}px; top:${pickerPosition.top}px;"
                >
                  <div class="seed-picker__title">Seeds</div>
                  <div class="seed-picker__list">
                    ${
                      seedEntries.length > 0
                        ? seedEntries
                            .map(({ seed, quantity }) => {
                              const crop = getProduct(seed.cropProductId);
                              return `
                                <button
                                  type="button"
                                  class="seed-picker__item"
                                  data-seed-choice="${seed.id}"
                                  data-seed-plot-id="${seedPickerPlot.id}"
                                >
                                  <span class="seed-picker__name">${seed.marketName}</span>
                                  <span class="seed-picker__meta">x${quantity} · ${crop?.growDurationMs ? `${Math.round(crop.growDurationMs / 1000)}s` : ""}</span>
                                </button>
                              `;
                            })
                            .join("")
                        : `<div class="seed-picker__empty">No seeds</div>`
                    }
                  </div>
                </div>
              `;
            })()
          : ""
      }
    `;
  }

  onStateChange(() => {
    render();
    updatePlotTooltip();
  });
  onProgressChange(updateProgress);
  render();
  window.addEventListener("resize", render);

  document.addEventListener("pointerdown", (event) => {
    if (!activeSeedPickerPlotId) {
      return;
    }

    if (event.target.closest("[data-seed-picker]") || event.target.closest("[data-farm-cell]")) {
      return;
    }

    closeSeedPicker();
    render();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !activeSeedPickerPlotId) {
      return;
    }

    closeSeedPicker();
    render();
  });

  function updateProgress() {
    for (const plot of state.farm.plots) {
      if (plot.stage !== "growing") {
        continue;
      }

      const cell = container.querySelector(`[data-cell-key="${plot.id}"]`);
      if (!cell) {
        continue;
      }

      const growthProgress = getPlotGrowthProgress(plot);
      const status = cell.querySelector(".farm-cell__status");
      const progressFill = cell.querySelector(".farm-cell__progress-fill");
      if (status) {
        status.textContent = `${getPlotStatusLabel(plot)} ${growthProgress}%`;
      }
      if (progressFill) {
        progressFill.style.width = `${growthProgress}%`;
      }
    }

    updatePlotTooltip();
  }
}
