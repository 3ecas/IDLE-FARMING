import { mountAnimalPen } from "./animalPen.js";
import { mountAnimalFeeder } from "./animalFeeder.js";
import { mountBarn } from "./barn.js";
import { mountBuild } from "./build.js";
import { mountBakery } from "./bakery.js";
import { mountChickenCoop } from "./chickenCoop.js";
import { mountFastItems } from "./fastItems.js";
import { mountMarket } from "./market.js";
import { mountMenu } from "./menu.js";
import { mountMill } from "./mill.js";
import { mountMoney } from "./money.js";
import { mountPlot } from "./plot.js";
import { mountSellMarket } from "./sellMarket.js";
import { mountShopping } from "./shopping.js";
import { mountFarmCursors } from "./cursor.js";
import { bootstrapGamePersistence } from "./persistence.js";
import { clearSelectedInventoryItem } from "./inventory.js";
import { isCellHidden, onStateChange, restartFarm, showCell, stabilizeLayoutPositions, state } from "./state.js";

const statusRoot = document.getElementById("status");
const cellMount = document.getElementById("cell-mount");
const marketMount = document.getElementById("market-mount");
const sellMarketMount = document.getElementById("sell-market-mount");
const moneyMount = document.getElementById("money-mount");
const shoppingMount = document.getElementById("shopping-mount");
const barnMount = document.getElementById("barn-mount");
const fastItemsMount = document.getElementById("fast-items-mount");
const buildMount = document.getElementById("build-mount");
const millMount = document.getElementById("mill-mount");
const bakeryMount = document.getElementById("bakery-mount");
const animalFeederMount = document.getElementById("animal-feeder-mount");
const animalPenMount = document.getElementById("animal-pen-mount");
const chickenCoopMount = document.getElementById("chicken-coop-mount");
const menuMount = document.getElementById("menu-mount");
const restartButton = document.querySelector("[data-restart-farm]");

function renderStatus() {
  statusRoot.textContent = state.message;
}

bootstrapGamePersistence();
mountPlot(cellMount);
mountMarket(marketMount);
mountSellMarket(sellMarketMount);
mountMoney(moneyMount);
mountShopping(shoppingMount);
mountBarn(barnMount);
mountFastItems(fastItemsMount);
mountBuild(buildMount);
mountMill(millMount);
mountBakery(bakeryMount);
mountAnimalFeeder(animalFeederMount);
mountAnimalPen(animalPenMount);
mountChickenCoop(chickenCoopMount);
mountMenu(menuMount);
mountFarmCursors();
onStateChange(renderStatus);
renderStatus();
ensureCorePanelsVisible();
refreshLayout();
window.requestAnimationFrame(() => {
  ensureCorePanelsVisible();
  refreshLayout();
});

function clearInteractionFromEmptySpace(event) {
  const interactiveElement = event.target.closest(
    "[data-cell-key], [data-delete-zone], [data-restart-farm], button, summary, input, textarea, select, a, label"
  );
  if (interactiveElement) {
    return false;
  }

  clearSelectedInventoryItem();
  return true;
}

document.addEventListener("pointerdown", clearInteractionFromEmptySpace, { capture: true });
document.addEventListener("click", clearInteractionFromEmptySpace, { capture: true });

if (restartButton) {
  restartButton.addEventListener("click", () => {
    restartFarm();
    ensureCorePanelsVisible();
    refreshLayout();
  });
}

function refreshLayout() {
  if (isCellHidden("money")) {
    showCell("money");
  }
  stabilizeLayoutPositions();
}

function ensureCorePanelsVisible() {
  if (isCellHidden("menu")) {
    showCell("menu");
  }

  if (isCellHidden("money")) {
    showCell("money");
  }
}

window.addEventListener("resize", refreshLayout);
