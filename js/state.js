const listeners = new Set();
const growthTimers = new Map();

let plotCounter = 5;
let groupCounter = 1;

export const state = {
  coins: 5,
  message: "Buy seeds, place plots, water crops, and harvest wheat.",
  selectedSeed: null,
  inventory: {
    wheatSeed: 0,
    landDeeds: 0,
  },
  warehouse: {
    wheat: 0,
  },
  layoutOrder: ["land-plots", "warehouse", "market", "tools"],
  plots: {
    "plot-1": createPlot("plot-1"),
    "plot-2": createPlot("plot-2"),
    "plot-3": createPlot("plot-3"),
    "plot-4": createPlot("plot-4"),
    "plot-5": createPlot("plot-5"),
  },
  board: [
    {
      id: "group-1",
      type: "group",
      plotIds: ["plot-1", "plot-2", "plot-3", "plot-4"],
    },
    {
      id: "slot-1",
      type: "single",
      plotIds: ["plot-5"],
    },
  ],
};

function createPlot(id) {
  return {
    id,
    crop: null,
    stage: 0,
    watered: false,
    growing: false,
    ready: false,
  };
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function getPlot(plotId) {
  return state.plots[plotId] || null;
}

function getBoardEntryForPlotId(plotId) {
  return state.board.find((entry) => entry.plotIds.includes(plotId)) || null;
}

function clearPlotTimers(plotId) {
  const timers = growthTimers.get(plotId);
  if (!timers) {
    return;
  }

  for (const timer of timers) {
    clearTimeout(timer);
  }
  growthTimers.delete(plotId);
}

function schedulePlotGrowth(plotId, callback, delay) {
  const timer = setTimeout(() => {
    const timers = growthTimers.get(plotId);
    if (timers) {
      timers.delete(timer);
      if (timers.size === 0) {
        growthTimers.delete(plotId);
      }
    }

    callback();
    notify();
  }, delay);

  if (!growthTimers.has(plotId)) {
    growthTimers.set(plotId, new Set());
  }

  growthTimers.get(plotId).add(timer);
}

function addSinglePlotEntry(plotId) {
  state.board.push({
    id: `slot-${state.board.length + 1}`,
    type: "single",
    plotIds: [plotId],
  });
}

function normalizeBoard() {
  state.board = state.board.filter((entry) => entry.plotIds.length > 0);

  for (const entry of state.board) {
    if (entry.type === "single" && entry.plotIds.length > 1) {
      entry.type = "group";
      entry.id = `group-${groupCounter++}`;
    }
  }
}

function startGrowth(plotId) {
  const plot = getPlot(plotId);
  if (!plot || !plot.crop || plot.growing) {
    return;
  }

  plot.growing = true;
  state.message = "The wheat is soaking up the water...";

  schedulePlotGrowth(
    plotId,
    () => {
      const current = getPlot(plotId);
      if (!current || !current.crop) {
        return;
      }
      current.stage = 1;
      state.message = "Tiny sprouts are peeking out!";
    },
    650
  );

  schedulePlotGrowth(
    plotId,
    () => {
      const current = getPlot(plotId);
      if (!current || !current.crop) {
        return;
      }
      current.stage = 2;
      state.message = "The wheat is growing bigger!";
    },
    1350
  );

  schedulePlotGrowth(
    plotId,
    () => {
      const current = getPlot(plotId);
      if (!current || !current.crop) {
        return;
      }
      current.stage = 3;
      current.growing = false;
      current.ready = true;
      state.message = "The wheat is ready to harvest!";
    },
    2100
  );
}

function setPlotEmpty(plotId) {
  const plot = getPlot(plotId);
  if (!plot) {
    return;
  }

  plot.crop = null;
  plot.stage = 0;
  plot.watered = false;
  plot.growing = false;
  plot.ready = false;
  clearPlotTimers(plotId);
}

export function onStateChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function buyWheatSeed() {
  if (state.coins < 1) {
    state.message = "You need 1 coin to buy a wheat seed.";
    notify();
    return false;
  }

  state.coins -= 1;
  state.inventory.wheatSeed += 1;
  state.message = "You bought a wheat seed.";
  notify();
  return true;
}

export function buyLandDeed() {
  if (state.coins < 3) {
    state.message = "You need 3 coins to buy a land plot deed.";
    notify();
    return false;
  }

  state.coins -= 3;
  state.inventory.landDeeds += 1;
  state.message = "You bought a land plot deed. Drag it to the land grid.";
  notify();
  return true;
}

export function selectWheatSeed() {
  if (state.inventory.wheatSeed <= 0) {
    state.message = "You do not have any wheat seeds yet.";
    notify();
    return false;
  }

  state.selectedSeed = "wheatSeed";
  state.message = "Seed selected. Click an empty plot to plant it.";
  notify();
  return true;
}

export function plantSelectedSeed(plotId) {
  const plot = getPlot(plotId);
  if (!plot) {
    return false;
  }

  if (state.selectedSeed !== "wheatSeed") {
    state.message = "Select a wheat seed from the market first.";
    notify();
    return false;
  }

  if (state.inventory.wheatSeed <= 0) {
    state.selectedSeed = null;
    state.message = "That seed stack is empty now.";
    notify();
    return false;
  }

  if (plot.crop) {
    state.message = "That plot already has a crop.";
    notify();
    return false;
  }

  state.inventory.wheatSeed -= 1;
  state.selectedSeed = null;
  plot.crop = "wheat";
  plot.stage = 0;
  plot.watered = false;
  plot.growing = false;
  plot.ready = false;
  state.message = `Planted wheat in ${plotId}.`;
  notify();
  return true;
}

export function waterPlot(plotId) {
  const plot = getPlot(plotId);
  if (!plot) {
    return false;
  }

  if (!plot.crop) {
    state.message = "There is nothing in that plot to water.";
    notify();
    return false;
  }

  if (plot.ready) {
    state.message = "That wheat is already ready to harvest.";
    notify();
    return false;
  }

  if (plot.watered) {
    state.message = "That wheat is already watered.";
    notify();
    return false;
  }

  plot.watered = true;
  startGrowth(plotId);
  notify();
  return true;
}

export function harvestWheat(plotId) {
  const plot = getPlot(plotId);
  if (!plot) {
    return false;
  }

  if (!plot.crop) {
    state.message = "There is nothing here to harvest.";
    notify();
    return false;
  }

  if (!plot.ready) {
    state.message = "That wheat is not ready yet.";
    notify();
    return false;
  }

  state.warehouse.wheat += 1;
  setPlotEmpty(plotId);
  state.message = "Harvest complete! The wheat is now in the warehouse.";
  notify();
  return true;
}

export function placePurchasedLandPlot() {
  if (state.inventory.landDeeds <= 0) {
    state.message = "Buy a land deed first.";
    notify();
    return false;
  }

  state.inventory.landDeeds -= 1;
  plotCounter += 1;
  const plotId = `plot-${plotCounter}`;
  state.plots[plotId] = createPlot(plotId);
  addSinglePlotEntry(plotId);
  state.message = `Placed a new land plot: ${plotId}.`;
  notify();
  return true;
}

export function moveWidget(widgetId, targetWidgetId) {
  const fromIndex = state.layoutOrder.indexOf(widgetId);
  const toIndex = state.layoutOrder.indexOf(targetWidgetId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return false;
  }

  const [moved] = state.layoutOrder.splice(fromIndex, 1);
  state.layoutOrder.splice(toIndex, 0, moved);
  notify();
  return true;
}

export function getPlotBoard() {
  return state.board;
}

export function getPlot(plotId) {
  return getPlot(plotId);
}

export function getBoardEntryForPlot(plotId) {
  return getBoardEntryForPlotId(plotId);
}

export function groupPlots(sourcePlotId, targetPlotId) {
  const sourceEntry = getBoardEntryForPlotId(sourcePlotId);
  const targetEntry = getBoardEntryForPlotId(targetPlotId);

  if (!sourceEntry || !targetEntry || sourcePlotId === targetPlotId || sourceEntry === targetEntry) {
    return false;
  }

  sourceEntry.plotIds = sourceEntry.plotIds.filter((id) => id !== sourcePlotId);
  if (sourceEntry.plotIds.length === 0) {
    state.board = state.board.filter((entry) => entry !== sourceEntry);
  }

  if (!targetEntry.plotIds.includes(sourcePlotId)) {
    targetEntry.plotIds.push(sourcePlotId);
  }

  if (targetEntry.type === "single" && targetEntry.plotIds.length > 1) {
    targetEntry.type = "group";
    targetEntry.id = `group-${groupCounter++}`;
  }

  normalizeBoard();
  notify();
  return true;
}

export function detachPlot(plotId) {
  const entry = getBoardEntryForPlotId(plotId);
  if (!entry) {
    return false;
  }

  if (entry.type === "single") {
    return true;
  }

  entry.plotIds = entry.plotIds.filter((id) => id !== plotId);
  addSinglePlotEntry(plotId);

  if (entry.plotIds.length === 1) {
    entry.type = "single";
    entry.id = `slot-${state.board.length + 1}`;
  }

  normalizeBoard();
  notify();
  return true;
}
