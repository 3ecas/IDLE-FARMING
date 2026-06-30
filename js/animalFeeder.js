import {
  getCellDragBounds,
  isBuildingBuilt,
  moveCell,
  onStateChange,
  state,
} from "./state.js";
import { mountMovableCell, wasRecentlyDragged } from "./drag.js";
import { getAnimalFeederSummary, openAnimalBuildingWindow } from "./animalBuildingWindow.js";

function clampToWorkspace(workspace, left, top) {
  const bounds = getCellDragBounds("animalFeeder");
  const maxLeft = Math.max(0, workspace.clientWidth - bounds.width);
  const maxTop = Math.max(0, workspace.clientHeight - bounds.height);

  return {
    left: Math.min(maxLeft, Math.max(0, left)),
    top: Math.min(maxTop, Math.max(0, top)),
  };
}

export function mountAnimalFeeder(container) {
  mountMovableCell(container, {
    key: "animalFeeder",
    selector: "[data-animal-feeder-cell]",
    dragHandle: ".animal-feeder-header",
    onDrop: (_dragSnapshot, finalPosition) => {
      moveCell("animalFeeder", finalPosition.left, finalPosition.top);
      return true;
    },
  });

  container.addEventListener("click", (event) => {
    const cell = event.target.closest("[data-animal-feeder-cell]");
    if (!cell || wasRecentlyDragged("animalFeeder")) {
      return;
    }

    openAnimalBuildingWindow("animalFeeder");
  });

  function render() {
    if (!isBuildingBuilt("animalFeeder")) {
      container.innerHTML = "";
      return;
    }

    const position = clampToWorkspace(
      container.closest(".workspace"),
      state.cells.animalFeeder.left,
      state.cells.animalFeeder.top
    );
    const summary = getAnimalFeederSummary();

    container.innerHTML = `
      <section class="animal-feeder-cell animal-building-scene-cell" data-cell-key="animalFeeder" data-animal-feeder-cell style="left:${position.left}px; top:${position.top}px;" aria-label="Animal feeder">
        <div class="animal-feeder-header">
          <span class="animal-feeder-title">
            <span class="animal-feeder-title__icon" aria-hidden="true">FD</span>
            <span class="animal-feeder-title__text">Animal Feeder</span>
          </span>
        </div>
        <div class="animal-building-scene-summary">
          <span>Auto targets x${summary.enabledCount}</span>
          <span>${summary.status}</span>
        </div>
      </section>
    `;
  }

  onStateChange(render);
  render();
}
