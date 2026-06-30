import { addCoins, onStateChange, state } from "./state.js";

const DAY_NIGHT_STORAGE_KEY = "idle-farm-day-night-cycle-v1";
const PHASE_DURATION_MS = 20 * 60 * 1000;
const CYCLE_DURATION_MS = PHASE_DURATION_MS * 2;
const UPDATE_INTERVAL_MS = 1000;

function readCycleStart() {
  try {
    const stored = Number(localStorage.getItem(DAY_NIGHT_STORAGE_KEY));
    if (Number.isFinite(stored) && stored > 0) {
      return stored;
    }
  } catch {
    // Best effort.
  }

  const startedAt = Date.now();
  try {
    localStorage.setItem(DAY_NIGHT_STORAGE_KEY, String(startedAt));
  } catch {
    // Best effort.
  }
  return startedAt;
}

function getCycleState(startedAt) {
  const elapsed = ((Date.now() - startedAt) % CYCLE_DURATION_MS + CYCLE_DURATION_MS) % CYCLE_DURATION_MS;
  const isNight = elapsed >= PHASE_DURATION_MS;
  const phaseElapsed = isNight ? elapsed - PHASE_DURATION_MS : elapsed;
  return {
    isNight,
    progress: Math.min(100, Math.max(0, (phaseElapsed / PHASE_DURATION_MS) * 100)),
  };
}

export function mountInfoPanel() {
  const startedAt = readCycleStart();

  function renderMoney() {
    document.querySelectorAll("[data-top-money-value]").forEach((moneyValue) => {
      moneyValue.textContent = String(state.coins);
    });
  }

  function renderCycle() {
    const cycleState = getCycleState(startedAt);
    document.body.classList.toggle("is-night", cycleState.isNight);
    document.querySelectorAll("[data-day-night-cell]").forEach((dayNightCell) => {
      dayNightCell.classList.toggle("is-night", cycleState.isNight);
    });
    document.querySelectorAll("[data-day-night-fill]").forEach((dayNightFill) => {
      dayNightFill.style.width = `${cycleState.progress}%`;
    });
    document.querySelectorAll("[data-cycle-phase]").forEach((phaseElement) => {
      phaseElement.textContent = cycleState.isNight ? "Night" : "Day";
    });
  }

  renderMoney();
  renderCycle();
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-add-coins]")) {
      addCoins(100);
    }
  });
  onStateChange(renderMoney);
  onStateChange(renderCycle);
  window.setInterval(renderCycle, UPDATE_INTERVAL_MS);
}
