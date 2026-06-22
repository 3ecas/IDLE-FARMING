import {
  detachPlot,
  getBoardEntryForPlotId,
  getPlot,
  getPlotBoard,
  groupPlots,
  harvestWheat,
  onStateChange,
  plantSelectedSeed,
  state,
  waterPlot,
} from "./state.js";

function cropEmoji(plot) {
  if (!plot.crop) {
    return "\u2022";
  }

  switch (plot.stage) {
    case 0:
      return "🌰";
    case 1:
      return "🌱";
    case 2:
      return "🌿";
    default:
      return "🌾";
  }
}

function plotLabel(plot) {
  if (!plot.crop) {
    return "Empty";
  }

  if (plot.ready) {
    return "Ready";
  }

  if (plot.growing) {
    return plot.stage === 1 ? "Sprouting" : "Growing";
  }

  if (plot.watered) {
    return "Watered";
  }

  return "Planted";
}

function plotHint(plot) {
  if (!plot.crop) {
    return state.selectedSeed === "wheatSeed"
      ? "Click to plant"
      : "Select a seed first";
  }

  if (plot.ready) {
    return "Drop harvest tool here";
  }

  if (plot.watered) {
    return "Waiting to grow";
  }

  return "Drop water here";
}

function plotMarkup(plot, options = {}) {
  const compact = options.compact ?? false;
  const classes = ["plot-tile", "drag-item"];
  if (compact) {
    classes.push("plot-mini");
  } else {
    classes.push("plot-single");
  }

  return `
    <article
      class="${classes.join(" ")}"
      draggable="true"
      data-plot-id="${plot.id}"
      data-plot-kind="plot"
    >
      <div class="plot-topline">
        <div class="plot-name">${plot.id}</div>
        <div class="plot-state">${plotLabel(plot)}</div>
      </div>
      <div class="plot-micro">
        <div class="plot-shadow"></div>
        <div class="plot-crop">${cropEmoji(plot)}</div>
      </div>
      <div class="plot-copy">
        <strong>${plotHint(plot)}</strong>
        <span>${plot.crop ? "Drag tools here or regroup the tile." : "Empty land tile."}</span>
      </div>
      <div class="plot-controls">
        <button class="plot-control" data-plot-action="plant" data-plot-target="${plot.id}">Plant</button>
        <button class="plot-control" data-plot-action="water" data-plot-target="${plot.id}">Water</button>
        <button class="plot-control" data-plot-action="harvest" data-plot-target="${plot.id}">Harvest</button>
      </div>
    </article>
  `;
}

function groupMarkup(entry) {
  const plots = entry.plotIds.map((plotId) => getPlot(plotId)).filter(Boolean);

  return `
    <section class="plot-group drag-item" draggable="true" data-group-id="${entry.id}" data-plot-kind="group">
      <div class="plot-group-header">
        <div class="plot-name">Group ${entry.id}</div>
        <div class="plot-state">${plots.length} plots</div>
      </div>
      <div class="plot-group-grid">
        ${plots.map((plot) => plotMarkup(plot, { compact: true })).join("")}
      </div>
    </section>
  `;
}

function renderBoardMarkup() {
  return getPlotBoard()
    .map((entry) => {
      if (entry.type === "group") {
        return groupMarkup(entry);
      }

      const plot = getPlot(entry.plotIds[0]);
      return plot ? plotMarkup(plot) : "";
    })
    .join("");
}

function handlePlotAction(event) {
  const button = event.target.closest("[data-plot-action]");
  if (!button) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const plotId = button.dataset.plotTarget;
  const action = button.dataset.plotAction;

  if (action === "plant") {
    plantSelectedSeed(plotId);
    return;
  }

  if (action === "water") {
    waterPlot(plotId);
    return;
  }

  if (action === "harvest") {
    harvestWheat(plotId);
  }
}

export function mountPlot(container) {
  container.addEventListener("click", handlePlotAction);

  container.addEventListener("dragstart", (event) => {
    const plotTile = event.target.closest("[data-plot-kind='plot']");
    const groupTile = event.target.closest("[data-plot-kind='group']");

    if (plotTile) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ kind: "plot", plotId: plotTile.dataset.plotId })
      );
      return;
    }

    if (groupTile) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ kind: "group", groupId: groupTile.dataset.groupId })
      );
    }
  });

  container.addEventListener("dragover", (event) => {
    event.preventDefault();
    const tile = event.target.closest(".plot-tile, .plot-group");
    if (tile) {
      tile.classList.add("drag-over");
    }
  });

  container.addEventListener("dragleave", (event) => {
    const tile = event.target.closest(".plot-tile, .plot-group");
    if (tile) {
      tile.classList.remove("drag-over");
    }
  });

  container.addEventListener("drop", (event) => {
    event.preventDefault();

    const payload = safeParseDrag(event.dataTransfer.getData("text/plain"));
    const targetPlot = event.target.closest("[data-plot-id]");
    const targetGroup = event.target.closest("[data-group-id]");

    if (!payload) {
      return;
    }

    if (payload.kind === "tool") {
      const plotId = targetPlot?.dataset.plotId;
      if (!plotId) {
        return;
      }

      if (payload.tool === "watering-can") {
        waterPlot(plotId);
      } else if (payload.tool === "harvest-tool") {
        harvestWheat(plotId);
      }
      return;
    }

    if (payload.kind === "land-deed") {
      const isBoardDrop = event.target.closest(".plot-board");
      if (isBoardDrop) {
        import("./state.js").then((mod) => mod.placePurchasedLandPlot());
      }
      return;
    }

    if (payload.kind === "plot") {
      const sourcePlotId = payload.plotId;
      const targetPlotId = targetPlot?.dataset.plotId;

      if (!targetPlotId) {
        detachPlot(sourcePlotId);
        return;
      }

      groupPlots(sourcePlotId, targetPlotId);
      return;
    }

    if (payload.kind === "group") {
      if (targetGroup) {
        const groupEntry = getPlotBoard().find((entry) => entry.id === payload.groupId);
        const targetEntry = getPlotBoard().find((entry) => entry.id === targetGroup.dataset.groupId);
        if (groupEntry && targetEntry && groupEntry !== targetEntry) {
          targetEntry.plotIds = Array.from(new Set([...targetEntry.plotIds, ...groupEntry.plotIds]));
          import("./state.js").then((mod) => {
            mod.onStateChange(() => {});
          });
        }
      }
    }
  });

  function render() {
    container.innerHTML = `
      <section class="widget-shell widget-dropzone plot-board">
        <div class="widget-header drag-handle" data-widget-handle="land-plots">
          <div class="widget-title">
            <strong>Land Plots</strong>
            <span>One tile is 1x1 land</span>
          </div>
          <div class="grab-hint">⋮⋮</div>
        </div>
        <div class="widget-body">
          <div class="plot-board">
            ${renderBoardMarkup()}
          </div>
          <div class="layout-tip">
            Drag plots together to make a group, or drag a plot out to make it separate again.
          </div>
        </div>
      </section>
    `;

    const tiles = container.querySelectorAll(".plot-tile, .plot-group");
    tiles.forEach((tile) => tile.classList.remove("drag-over"));
  }

  onStateChange(render);
  render();
}

function safeParseDrag(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
