import { applyStarterLayout, onStateChange, state } from "./state.js";

const GAME_STATE_STORAGE_KEY = "idle-farm-game-state-v1";
const CELL_POSITION_KEYS = ["farm", "market", "sellMarket", "money", "barn", "menu", "build", "mill", "tools"];
const SAVE_DEBOUNCE_MS = 120;

let saveTimer = null;
let bootstrapped = false;

function hasStoredCellLayout() {
  try {
    return CELL_POSITION_KEYS.some((key) => localStorage.getItem(`idle-farm-${key}-cell-position`) !== null);
  } catch {
    return false;
  }
}

function readSavedGameState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GAME_STATE_STORAGE_KEY) || "null");
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function saveGameState() {
  try {
    const snapshot = {
      coins: state.coins,
      barn: state.barn.items,
      shopping: state.shopping.items,
      sell: state.sell.items,
    };

    localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Best effort.
  }
}

function scheduleSave() {
  if (saveTimer) {
    window.clearTimeout(saveTimer);
  }

  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    saveGameState();
  }, SAVE_DEBOUNCE_MS);
}

function applySavedGameState(snapshot) {
  if (!snapshot) {
    return;
  }

  if (Number.isFinite(snapshot.coins)) {
    state.coins = snapshot.coins;
  }

  if (snapshot.barn && typeof snapshot.barn === "object") {
    state.barn.items = { ...snapshot.barn };
  }

  if (snapshot.shopping && typeof snapshot.shopping === "object") {
    state.shopping.items = { ...snapshot.shopping };
  }

  if (snapshot.sell && typeof snapshot.sell === "object") {
    state.sell.items = { ...snapshot.sell };
  }
}

export function bootstrapGamePersistence() {
  if (bootstrapped) {
    return;
  }

  bootstrapped = true;

  const snapshot = readSavedGameState();
  applySavedGameState(snapshot);

  if (!hasStoredCellLayout()) {
    applyStarterLayout(true);
  }

  onStateChange(scheduleSave);
  saveGameState();
  window.addEventListener("beforeunload", saveGameState);
}
