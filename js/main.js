import { mountBarn } from "./barn.js";
import { mountMarket } from "./market.js";
import { mountMoney } from "./money.js";
import { mountPlot } from "./plot.js";
import { mountShopping } from "./shopping.js";
import { mountTools } from "./tools.js";
import { getCellSize } from "./layout.js";
import { clearSelectedInventoryItem } from "./inventory.js";
import { applyStarterLayout, clearActiveTool, isCellHidden, moveCell, onStateChange, restartFarm, state } from "./state.js";

const statusRoot = document.getElementById("status");
const cellMount = document.getElementById("cell-mount");
const marketMount = document.getElementById("market-mount");
const moneyMount = document.getElementById("money-mount");
const shoppingMount = document.getElementById("shopping-mount");
const barnMount = document.getElementById("barn-mount");
const toolsMount = document.getElementById("tools-mount");
const restartButton = document.querySelector("[data-restart-farm]");

function renderStatus() {
  statusRoot.textContent = state.message;
}

mountPlot(cellMount);
mountMarket(marketMount);
mountMoney(moneyMount);
mountShopping(shoppingMount);
mountBarn(barnMount);
mountTools(toolsMount);
onStateChange(renderStatus);
renderStatus();
applyStarterLayout();

document.addEventListener("pointerdown", (event) => {
  const interactiveElement = event.target.closest(
    "[data-cell-key], [data-delete-zone], [data-restart-farm], button, summary, input, textarea, select, a, label"
  );
  if (interactiveElement) {
    return;
  }

  clearActiveTool();
  clearSelectedInventoryItem();
});

if (restartButton) {
  restartButton.addEventListener("click", () => {
    restartFarm();
    refreshLayout();
  });
}

function refreshLayout() {
  const workspace = document.getElementById("workspace");
  if (!workspace) {
    return;
  }

  if (workspace.clientWidth < 720) {
    const left = 16;
    const gap = 12;
    if (!isCellHidden("barn")) {
      moveCell("barn", left, 16);
    }

    const barnElement = isCellHidden("barn") ? null : document.querySelector("[data-barn-cell]");
    const marketElement = isCellHidden("market") ? null : document.querySelector("[data-market-cell]");
    const shoppingElement = isCellHidden("shopping") ? null : document.querySelector("[data-shopping-cell]");
    const barnBottom = barnElement ? barnElement.offsetTop + barnElement.offsetHeight : 16;
    const marketBottom = marketElement ? marketElement.offsetTop + marketElement.offsetHeight : barnBottom;
    const shoppingBottom = shoppingElement ? shoppingElement.offsetTop + shoppingElement.offsetHeight : marketBottom;
    let top = Math.max(barnBottom, marketBottom, shoppingBottom) + gap;

    if (!isCellHidden("market")) {
      moveCell("market", left, top);
      top += getCellSize("market").height + gap;
    }

    if (!isCellHidden("money")) {
      moveCell("money", left, top);
      top += getCellSize("money").height + gap;
    }

    if (!isCellHidden("tools")) {
      moveCell("tools", left, top);
    }
    return;
  }

  for (const key of ["market", "money", "barn", "tools"]) {
    if (isCellHidden(key)) {
      continue;
    }

    const position = state.cells[key];
    moveCell(key, position.left, position.top);
  }
}

window.addEventListener("resize", refreshLayout);
refreshLayout();
