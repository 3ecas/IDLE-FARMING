import { addCoins, onStateChange, state } from "./state.js";

export function mountInfoPanel() {
  function renderMoney() {
    document.querySelectorAll("[data-top-money-value]").forEach((moneyValue) => {
      moneyValue.textContent = String(state.coins);
    });
  }

  renderMoney();
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-add-coins]")) {
      addCoins(100);
    }
  });
  onStateChange(renderMoney);
}
