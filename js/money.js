import { addCoins, getCellDragBounds, isCellHidden, moveCell, onStateChange, state } from "./state.js";
import { mountMovableCell } from "./drag.js";

function clampToWorkspace(workspace, left, top) {
  const bounds = getCellDragBounds("money");
  const maxLeft = Math.max(0, workspace.clientWidth - bounds.width);
  const maxTop = Math.max(0, workspace.clientHeight - bounds.height);

  return {
    left: Math.min(maxLeft, Math.max(0, left)),
    top: Math.min(maxTop, Math.max(0, top)),
  };
}

export function mountMoney(container) {
  mountMovableCell(container, {
    key: "money",
    selector: "[data-money-cell]",
    onDrop: (_dragSnapshot, finalPosition) => {
      moveCell("money", finalPosition.left, finalPosition.top);
      return true;
    },
  });

  container.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-coins]");
    if (!addButton) {
      return;
    }

    addCoins(100);
  });

  function render() {
    if (isCellHidden("money")) {
      container.innerHTML = "";
      return;
    }

    const position = clampToWorkspace(
      container.closest(".workspace"),
      state.cells.money.left,
      state.cells.money.top
    );

    container.innerHTML = `
      <section class="money-cell" data-cell-key="money" data-money-cell style="left:${position.left}px; top:${position.top}px;" aria-label="Money">
        <div class="money-header">
          <span class="money-title">Money</span>
        </div>
        <div class="money-body">
          <span class="money-coin" aria-hidden="true"></span>
          <span class="money-value">${state.coins}</span>
        </div>
        <button type="button" class="money-add" data-add-coins>+</button>
      </section>
    `;
  }

  onStateChange(render);
  render();
}
