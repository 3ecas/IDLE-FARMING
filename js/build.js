import {
  buildBakery,
  buildAnimalFeeder,
  buildAnimalPen,
  buildBeehive,
  buildChickenCoop,
  buildMill,
  canBuildBakery,
  canBuildAnimalFeeder,
  canBuildAnimalPen,
  canBuildBeehive,
  canBuildChickenCoop,
  canBuildMill,
  getBarnItemQuantity,
  getCellDragBounds,
  hideCell,
  isBuildingBuilt,
  isCellHidden,
  moveCell,
  onStateChange,
  setMessage,
  state,
} from "./state.js";
import { mountMovableCell } from "./drag.js";

function clampToWorkspace(workspace, left, top) {
  const bounds = getCellDragBounds("build");
  const maxLeft = Math.max(0, workspace.clientWidth - bounds.width);
  const maxTop = Math.max(0, workspace.clientHeight - bounds.height);

  return {
    left: Math.min(maxLeft, Math.max(0, left)),
    top: Math.min(maxTop, Math.max(0, top)),
  };
}

function renderBuildProduct(option) {
  return `
    <button type="button" class="build-product ${option.isBuilt || !option.canBuild ? "is-disabled" : ""}" ${option.dataAttribute} aria-disabled="${option.isBuilt || !option.canBuild ? "true" : "false"}">
      <span class="build-product__main">
        <span class="build-product__name">${option.label}</span>
      </span>
      ${option.isBuilt ? "" : `<span class="build-product__cost">${option.costLabel}</span>`}
    </button>
  `;
}

function sortBuildProductsByCost(firstOption, secondOption) {
  return firstOption.totalCost - secondOption.totalCost;
}

export function mountBuild(container) {
  mountMovableCell(container, {
    key: "build",
    selector: "[data-build-cell]",
    dragHandle: ".build-header",
    onDrop: (_dragSnapshot, finalPosition) => {
      moveCell("build", finalPosition.left, finalPosition.top);
      return true;
    },
  });

  container.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-close-cell]");
    if (closeButton) {
      event.preventDefault();
      hideCell("build");
      setMessage("Build closed.");
      return;
    }

    const millButton = event.target.closest("[data-build-mill]");
    if (millButton) {
      event.preventDefault();
      buildMill();
      return;
    }

    const bakeryButton = event.target.closest("[data-build-bakery]");
    if (bakeryButton) {
      event.preventDefault();
      buildBakery();
      return;
    }

    const animalFeederButton = event.target.closest("[data-build-animal-feeder]");
    if (animalFeederButton) {
      event.preventDefault();
      buildAnimalFeeder();
      return;
    }

    const animalPenButton = event.target.closest("[data-build-animal-pen]");
    if (animalPenButton) {
      event.preventDefault();
      buildAnimalPen();
      return;
    }

    const chickenCoopButton = event.target.closest("[data-build-chicken-coop]");
    if (chickenCoopButton) {
      event.preventDefault();
      buildChickenCoop();
      return;
    }

    const beehiveButton = event.target.closest("[data-build-beehive]");
    if (beehiveButton) {
      event.preventDefault();
      buildBeehive();
    }
  });

  function render() {
    if (isCellHidden("build")) {
      container.innerHTML = "";
      return;
    }

    const position = clampToWorkspace(
      container.closest(".workspace"),
      state.cells.build.left,
      state.cells.build.top
    );
    const millBuilt = isBuildingBuilt("mill");
    const bakeryBuilt = isBuildingBuilt("bakery");
    const animalFeederBuilt = isBuildingBuilt("animalFeeder");
    const animalPenBuilt = isBuildingBuilt("animalPen");
    const chickenCoopBuilt = isBuildingBuilt("chickenCoop");
    const beehiveBuilt = isBuildingBuilt("beehive");
    const wood = getBarnItemQuantity("wood");
    const nails = getBarnItemQuantity("nails");
    const millLabel = millBuilt ? "Already Built" : "Mill";
    const bakeryLabel = bakeryBuilt ? "Already Built" : "Bakery";
    const animalFeederLabel = animalFeederBuilt ? "Already Built" : "Animal Feeder";
    const animalPenLabel = animalPenBuilt ? "Already Built" : "Animal Pen";
    const chickenCoopLabel = chickenCoopBuilt ? "Already Built" : "Chicken Coop";
    const beehiveLabel = beehiveBuilt ? "Already Built" : "Beehive";
    const buildProducts = [
      {
        label: millLabel,
        isBuilt: millBuilt,
        canBuild: canBuildMill(),
        totalCost: 35,
        costLabel: `Wood ${wood}/35`,
        dataAttribute: "data-build-mill",
      },
      {
        label: bakeryLabel,
        isBuilt: bakeryBuilt,
        canBuild: canBuildBakery(),
        totalCost: 100,
        costLabel: `Wood ${wood}/75 - Nails ${nails}/25`,
        dataAttribute: "data-build-bakery",
      },
      {
        label: animalFeederLabel,
        isBuilt: animalFeederBuilt,
        canBuild: canBuildAnimalFeeder(),
        totalCost: 150,
        costLabel: `Wood ${wood}/125 - Nails ${nails}/25`,
        dataAttribute: "data-build-animal-feeder",
      },
      {
        label: animalPenLabel,
        isBuilt: animalPenBuilt,
        canBuild: canBuildAnimalPen(),
        totalCost: 55,
        costLabel: `Wood ${wood}/55`,
        dataAttribute: "data-build-animal-pen",
      },
      {
        label: chickenCoopLabel,
        isBuilt: chickenCoopBuilt,
        canBuild: canBuildChickenCoop(),
        totalCost: 25,
        costLabel: `Wood ${wood}/25`,
        dataAttribute: "data-build-chicken-coop",
      },
      {
        label: beehiveLabel,
        isBuilt: beehiveBuilt,
        canBuild: canBuildBeehive(),
        totalCost: 25,
        costLabel: `Wood ${wood}/25`,
        dataAttribute: "data-build-beehive",
      },
    ].sort(sortBuildProductsByCost);

    container.innerHTML = `
      <section class="build-cell" data-cell-key="build" data-build-cell style="left:${position.left}px; top:${position.top}px;" aria-label="Build">
        <div class="build-header">
          <span class="build-title">
            <span class="build-title__icon" aria-hidden="true">🔨</span>
            <span class="build-title__text">Build</span>
          </span>
          <button type="button" class="cell-close" data-close-cell aria-label="Close Build">x</button>
        </div>
        <div class="build-body">
          ${buildProducts.map(renderBuildProduct).join("")}
        </div>
      </section>
    `;
  }

  onStateChange(render);
  render();
}
