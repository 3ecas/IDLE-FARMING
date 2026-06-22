import { buyLandDeed, buyWheatSeed, onStateChange, placePurchasedLandPlot, state } from "./state.js";

export function mountMarket(container) {
  container.addEventListener("click", (event) => {
    const seedButton = event.target.closest("[data-action='buy-seed']");
    if (seedButton) {
      buyWheatSeed();
      return;
    }

    const deedButton = event.target.closest("[data-action='buy-deed']");
    if (deedButton) {
      buyLandDeed();
      return;
    }

    const placeButton = event.target.closest("[data-action='place-deed']");
    if (placeButton) {
      placePurchasedLandPlot();
    }
  });

  function render() {
    container.innerHTML = `
      <section class="widget-shell">
        <div class="widget-header drag-handle" data-widget-handle="market">
          <div class="widget-title">
            <strong>Market</strong>
            <span>Seeds and farm expansion</span>
          </div>
          <div class="grab-hint">⋮⋮</div>
        </div>
        <div class="widget-body">
          <div class="accordion">
            <details open>
              <summary>
                <span>Seeds</span>
                <span>${state.inventory.wheatSeed} in stock</span>
              </summary>
              <div class="accordion-content">
                <div class="market-item">
                  <div class="seed-card">
                    <div class="item-icon">🌰</div>
                    <div class="item-copy">
                      <strong>Wheat seed</strong>
                      <span>Cost: 1 coin</span>
                    </div>
                  </div>
                  <button class="action-button" data-action="buy-seed" ${state.coins < 1 ? "disabled" : ""}>
                    Buy wheat seed
                  </button>
                  <div class="market-small">Seeds go into your inventory. Select one to plant on an empty plot.</div>
                </div>
              </div>
            </details>

            <details>
              <summary>
                <span>Farm expansion</span>
                <span>${state.inventory.landDeeds} deed${state.inventory.landDeeds === 1 ? "" : "s"}</span>
              </summary>
              <div class="accordion-content">
                <div class="market-item">
                  <div class="land-deed drag-item" draggable="true" data-drag-kind="land-deed" data-deed-action="place">
                    <div class="item-icon">🧾</div>
                    <div class="item-copy">
                      <strong>Land plot deed</strong>
                      <span>Cost: 3 coins</span>
                    </div>
                  </div>
                  <button class="action-button" data-action="buy-deed" ${state.coins < 3 ? "disabled" : ""}>
                    Buy land deed
                  </button>
                  <button class="plot-control" data-action="place-deed" ${state.inventory.landDeeds <= 0 ? "disabled" : ""}>
                    Place one in the grid
                  </button>
                  <div class="market-small">You can also drag the deed card from the market to the land grid.</div>
                </div>
              </div>
            </details>
          </div>
          <div class="section-footer">
            <strong>Coins:</strong> ${state.coins}
          </div>
        </div>
      </section>
    `;
  }

  onStateChange(render);
  render();
}
