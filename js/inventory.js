import { onStateChange, selectWheatSeed, state } from "./state.js";

export function mountInventory(container) {
  container.addEventListener("click", (event) => {
    const item = event.target.closest("[data-seed='wheat']");
    if (!item) {
      return;
    }

    selectWheatSeed();
  });

  function render() {
    container.innerHTML = `
      <div class="market-inventory">
        <div class="market-small">Seed inventory</div>
        <button class="seed-button seed-card drag-item" data-seed="wheat" type="button" ${state.inventory.wheatSeed <= 0 ? "disabled" : ""}>
          <div class="item-icon">🌱</div>
          <div class="item-copy">
            <strong>Wheat seeds</strong>
            <span>Owned: ${state.inventory.wheatSeed}</span>
          </div>
        </button>
      </div>
    `;
  }

  onStateChange(render);
  render();
}
