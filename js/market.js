import { addShoppingItem, buyLandPlot, getCellDragBounds, getNextLandPlotCost, isCellHidden, moveCell, onStateChange, setMessage, state } from "./state.js";
import { MARKET_SECTIONS, getProduct } from "./catalog.js";
import { mountMovableCell } from "./drag.js";

let marketOpen = false;
let seedsOpen = true;
let upgradesOpen = false;

function clampToWorkspace(workspace, left, top) {
  const bounds = getCellDragBounds("market");
  const maxLeft = Math.max(0, workspace.clientWidth - bounds.width);
  const maxTop = Math.max(0, workspace.clientHeight - bounds.height);

  return {
    left: Math.min(maxLeft, Math.max(0, left)),
    top: Math.min(maxTop, Math.max(0, top)),
  };
}

function renderProductButton(product) {
  return `
    <button type="button" class="market-product" data-product-id="${product.id}">
      <span class="market-product__name">${product.marketName}</span>
      <span class="market-product__price">
        <span class="price-coin" aria-hidden="true"></span>
        <span class="price-value">${product.price}</span>
      </span>
    </button>
  `;
}

function renderLandPlotButton() {
  const cost = getNextLandPlotCost();
  return `
    <button type="button" class="market-product market-product--upgrade" data-buy-land-plot>
      <span class="market-product__name">Land plot</span>
      <span class="market-product__price">
        <span class="price-coin" aria-hidden="true"></span>
        <span class="price-value">${cost}</span>
      </span>
    </button>
  `;
}

export function mountMarket(container) {
  mountMovableCell(container, {
    key: "market",
    selector: "[data-market-cell]",
    onDrop: (_dragSnapshot, finalPosition) => {
      moveCell("market", finalPosition.left, finalPosition.top);
      return true;
    },
  });

  container.addEventListener("click", (event) => {
    const productButton = event.target.closest("[data-product-id]");
    if (productButton) {
      addShoppingItem(productButton.dataset.productId);
      return;
    }

    const plotButton = event.target.closest("[data-buy-land-plot]");
    if (plotButton) {
      buyLandPlot();
      return;
    }

    const toggle = event.target.closest("[data-market-toggle]");
    if (toggle) {
      event.preventDefault();
      marketOpen = !marketOpen;
      setMessage(marketOpen ? "Market open." : "Market hidden.");
      render();
      return;
    }

    const seedsToggle = event.target.closest("[data-seeds-toggle]");
    if (seedsToggle) {
      event.preventDefault();
      seedsOpen = !seedsOpen;
      render();
      return;
    }

    const upgradesToggle = event.target.closest("[data-upgrades-toggle]");
    if (upgradesToggle) {
      event.preventDefault();
      upgradesOpen = !upgradesOpen;
      render();
    }
  });

  function render() {
    if (isCellHidden("market")) {
      container.innerHTML = "";
      return;
    }

    const position = clampToWorkspace(
      container.closest(".workspace"),
      state.cells.market.left,
      state.cells.market.top
    );

    const seedItems = MARKET_SECTIONS.find((section) => section.key === "seeds")?.productIds || [];
    const upgradeItems = MARKET_SECTIONS.find((section) => section.key === "farmUpgrades")?.productIds || [];

    container.innerHTML = `
      <section class="market-cell ${marketOpen ? "is-open" : "is-closed"}" data-cell-key="market" data-market-cell style="left:${position.left}px; top:${position.top}px;" aria-label="Market">
        <div class="market-header">
          <span class="market-title">Market</span>
          <button type="button" class="market-toggle" data-market-toggle>${marketOpen ? "Hide" : "Show"}</button>
        </div>
        <div class="market-body ${marketOpen ? "" : "is-hidden"}">
          ${
            marketOpen
              ? `
                <details class="market-seeds" ${seedsOpen ? "open" : ""}>
                  <summary data-seeds-toggle>${MARKET_SECTIONS[0].label}</summary>
                  <div class="market-seeds__body">
                    ${seedItems.map((productId) => renderProductButton(getProduct(productId))).join("")}
                  </div>
                </details>
                <details class="market-upgrades" ${upgradesOpen ? "open" : ""}>
                  <summary data-upgrades-toggle>${MARKET_SECTIONS[1].label}</summary>
                  <div class="market-upgrades__body">
                    ${renderLandPlotButton()}
                    ${upgradeItems.map((productId) => renderProductButton(getProduct(productId))).join("")}
                  </div>
                </details>
              `
              : ""
          }
        </div>
      </section>
    `;
  }

  onStateChange(render);
  render();
}
