import { getProduct } from "./catalog.js";
import {
  getCellDragBounds,
  isBuildingBuilt,
  moveCell,
  onProgressChange,
  onStateChange,
  state,
} from "./state.js";
import { mountMovableCell, wasRecentlyDragged } from "./drag.js";
import { getAnimalBuildingSummary, openAnimalBuildingWindow } from "./animalBuildingWindow.js";

function clampToWorkspace(workspace, left, top) {
  const bounds = getCellDragBounds("beehive");
  const maxLeft = Math.max(0, workspace.clientWidth - bounds.width);
  const maxTop = Math.max(0, workspace.clientHeight - bounds.height);

  return {
    left: Math.min(maxLeft, Math.max(0, left)),
    top: Math.min(maxTop, Math.max(0, top)),
  };
}

export function getBeehiveDropTargetFromPoint(x, y) {
  if (!isBuildingBuilt("beehive")) {
    return null;
  }

  const element = document.elementFromPoint(x, y);
  if (!element) {
    return null;
  }

  return element.closest?.("[data-beehive-cell], [data-beehive-animal-drop]") ? "animals" : null;
}

export function mountBeehive(container) {
  mountMovableCell(container, {
    key: "beehive",
    selector: "[data-beehive-cell]",
    dragHandle: ".beehive-header",
    onDrop: (_dragSnapshot, finalPosition) => {
      moveCell("beehive", finalPosition.left, finalPosition.top);
      return true;
    },
  });

  container.addEventListener("click", (event) => {
    const cell = event.target.closest("[data-beehive-cell]");
    if (!cell || wasRecentlyDragged("beehive")) {
      return;
    }

    openAnimalBuildingWindow("beehive");
  });

  function render() {
    if (!isBuildingBuilt("beehive")) {
      container.innerHTML = "";
      return;
    }

    const position = clampToWorkspace(
      container.closest(".workspace"),
      state.cells.beehive.left,
      state.cells.beehive.top
    );

    const summary = getAnimalBuildingSummary("beehive");
    const beeProduct = getProduct("bee");

    container.innerHTML = `
      <section class="animal-pen-cell beehive-cell animal-building-scene-cell" data-cell-key="beehive" data-beehive-cell style="left:${position.left}px; top:${position.top}px;" aria-label="Beehive">
        <div class="animal-pen-header beehive-header">
          <span class="animal-pen-title beehive-title">
            <span class="animal-pen-title__icon beehive-title__icon" aria-hidden="true">🐝</span>
            <span class="animal-pen-title__text">Beehive</span>
          </span>
        </div>
        <div class="animal-building-scene-summary">
          <span>${beeProduct?.marketName || "Bees"} x${summary.animalCount}</span>
          <span>${summary.status}</span>
        </div>
      </section>
    `;
  }

  onStateChange(render);
  onProgressChange(render);
  render();
  window.addEventListener("resize", render);
}
