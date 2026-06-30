import { getProduct } from "./catalog.js";
import {
  addAnimalFoodToPen,
  addAnimalToPen,
  addChickenFoodToCoop,
  getAnimalFeederSlots,
  getAnimalFeederStatusText,
  getAnimalSlotInfo,
  getBarnItemQuantity,
  onProgressChange,
  onStateChange,
  removeAnimalFoodFromPen,
  removeChickenFoodFromCoop,
  returnAnimalFromPen,
  state,
  toggleAnimalFeederTarget,
} from "./state.js";

const BUILDING_CONFIGS = {
  animalPen: {
    id: "animalPen",
    title: "Animal Pen",
    icon: "🐄",
    animalProductIds: ["cow", "sheep"],
    animalLabel: "Animals",
    foodProductIds: ["strawCrop", "cornCrop"],
    penKey: "animalPen",
    foodDropAttribute: "data-animal-pen-food-drop",
    animalDropAttribute: "data-animal-pen-cell",
    addFood: addAnimalFoodToPen,
    removeFood: removeAnimalFoodFromPen,
  },
  chickenCoop: {
    id: "chickenCoop",
    title: "Chicken Coop",
    icon: "🐔",
    animalProductIds: ["chicken"],
    animalLabel: "Chickens",
    foodProductIds: ["cornCrop"],
    penKey: "chickenCoop",
    foodDropAttribute: "data-chicken-coop-food-drop",
    animalDropAttribute: "data-chicken-coop-cell",
    addFood: addChickenFoodToCoop,
    removeFood: removeChickenFoodFromCoop,
  },
  beehive: {
    id: "beehive",
    title: "Beehive",
    icon: "🐝",
    animalProductIds: ["bee"],
    animalLabel: "Bees",
    foodProductIds: [],
    penKey: "beehive",
    foodDropAttribute: "data-beehive-food-drop",
    animalDropAttribute: "data-beehive-cell",
    addFood: () => false,
    removeFood: () => false,
  },
};

const FEEDER_FOOD_ROWS = [
  { productId: "strawCrop", label: "Animal Pen", penKey: "animalPen" },
  { productId: "cornCrop", label: "Animal Pen", penKey: "animalPen" },
  { productId: "cornCrop", label: "Chicken Coop", penKey: "chickenCoop" },
];

let root = null;
let activeBuildingId = null;

function ensureRoot() {
  if (root) {
    return root;
  }

  root = document.createElement("div");
  root.className = "building-window-root";
  root.setAttribute("data-building-window-root", "");
  document.body.append(root);
  root.addEventListener("click", handleWindowClick);
  root.addEventListener("contextmenu", handleWindowContextMenu);
  root.addEventListener("input", handleWindowInput);
  return root;
}

function getAmount(rootElement) {
  const input = rootElement.querySelector("[data-building-food-amount]");
  const value = Math.max(1, Math.floor(Number(input?.value) || 1));
  if (input) {
    input.value = String(value);
  }
  return value;
}

function formatQuantity(quantity) {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1);
}

function getProductionProgress(animal) {
  if (!animal || !Number.isFinite(animal.readyAt)) {
    return 0;
  }

  const animalProduct = getProduct(animal.productId);
  const outputProduct = animalProduct?.outputProductId ? getProduct(animalProduct.outputProductId) : null;
  const duration = Number.isFinite(outputProduct?.productionDurationMs) ? outputProduct.productionDurationMs : 0;
  if (duration <= 0) {
    return 0;
  }

  const remaining = Math.max(0, animal.readyAt - Date.now());
  return Math.max(0, Math.min(100, Math.round((1 - remaining / duration) * 100)));
}

function getAnimalStatus(animal, outputProduct) {
  if (Number.isFinite(animal.readyAt)) {
    return `${outputProduct?.marketName || "Product"} ${getProductionProgress(animal)}%`;
  }

  if (!outputProduct?.foodCost || Object.keys(outputProduct.foodCost).length === 0) {
    return "Starting";
  }

  return "Needs food";
}

export function getAnimalBuildingSummary(buildingId) {
  const config = BUILDING_CONFIGS[buildingId];
  if (!config) {
    return { animalCount: 0, producingCount: 0, status: "" };
  }

  const pen = state[config.penKey];
  const animals = Array.isArray(pen?.animals) ? pen.animals : [];
  const producingCount = animals.filter((animal) => Number.isFinite(animal.readyAt)).length;
  let status = "No animals";
  if (animals.length > 0 && producingCount > 0) {
    status = `Producing x${producingCount}`;
  } else if (animals.length > 0) {
    status = "Waiting";
  }

  return {
    animalCount: animals.length,
    producingCount,
    status,
  };
}

export function getAnimalFeederSummary() {
  const slots = getAnimalFeederSlots();
  const enabledCount = slots.filter((slot) => slot.enabled).length;
  return {
    enabledCount,
    status: getAnimalFeederStatusText(),
  };
}

function renderFoodControlRow(config, foodProductId) {
  const pen = state[config.penKey];
  const foodProduct = getProduct(foodProductId);
  const storedQuantity = pen?.food?.[foodProductId] || 0;
  const barnQuantity = getBarnItemQuantity(foodProductId);

  return `
    <div class="building-food-row">
      <div class="building-window-section__title">
        <span>${foodProduct?.icon || ""}</span>
        <span>${foodProduct?.marketName || "Food"}</span>
      </div>
      <div class="building-food-control">
        <button type="button" class="building-food-control__button" data-building-food-action="remove" data-building-food-product="${foodProductId}" ${storedQuantity > 0 ? "" : "disabled"}>-</button>
        <input class="building-food-control__input" data-building-food-amount type="number" min="1" step="1" value="1" inputmode="numeric" aria-label="Food quantity" />
        <button type="button" class="building-food-control__button" data-building-food-action="add" data-building-food-product="${foodProductId}" ${barnQuantity > 0 ? "" : "disabled"}>+</button>
      </div>
      <div class="building-window-meta">
        <span>Stored x${formatQuantity(storedQuantity)}</span>
        <span>Barn x${formatQuantity(barnQuantity)}</span>
      </div>
    </div>
  `;
}

function renderFoodControls(config) {
  const foodProductIds = Array.isArray(config.foodProductIds) ? config.foodProductIds : [];
  return `
    <section class="building-window-section building-window-section--food" ${config.foodDropAttribute}>
      ${
        foodProductIds.length > 0
          ? foodProductIds.map((productId) => renderFoodControlRow(config, productId)).join("")
          : `
            <div class="building-window-section__title">
              <span>${config.icon}</span>
              <span>No feed needed</span>
            </div>
            <div class="building-window-meta">
              <span>This building produces on its own.</span>
            </div>
          `
      }
    </section>
  `;
}

function renderAnimalSlot(config, animal, index, animalProductId = null) {
  const animalProduct = getProduct(animal?.productId || animalProductId);
  const outputProduct = animalProduct?.outputProductId ? getProduct(animalProduct.outputProductId) : null;
  if (!animal) {
    const barnQuantity = getBarnItemQuantity(animalProductId);
    const slotInfo = getAnimalSlotInfo(animalProductId);
    const needsSlot = !slotInfo.hasOpenSlot;
    const canAdd = barnQuantity > 0 && (!needsSlot || slotInfo.canAffordNextSlot);
    const slotText = needsSlot ? `Slot ${slotInfo.nextSlotCost} coins` : "Open slot";
    return `
      <button type="button" class="building-animal-slot building-animal-slot--empty" data-building-add-animal="${animalProductId}" ${canAdd ? "" : "disabled"}>
        <span class="building-animal-slot__icon" aria-hidden="true">+</span>
        <span class="building-animal-slot__name">Add ${animalProduct?.marketName || "Animal"}</span>
        <span class="building-animal-slot__status">${slotText}</span>
      </button>
    `;
  }

  const progress = getProductionProgress(animal);
  const status = getAnimalStatus(animal, outputProduct);
  return `
    <div class="building-animal-slot" data-building-animal-id="${animal.id}" aria-label="${animalProduct?.marketName || "Animal"} ${index + 1}">
      <span class="building-animal-slot__icon" aria-hidden="true">${animalProduct?.icon || config.icon}</span>
      <span class="building-animal-slot__progress" aria-hidden="true">
        <span class="building-animal-slot__progress-fill" style="width:${progress}%"></span>
      </span>
      <span class="building-animal-slot__name">${animalProduct?.marketName || "Animal"}</span>
      <span class="building-animal-slot__status">${status}</span>
    </div>
  `;
}

function renderAnimalSlots(config) {
  const pen = state[config.penKey];
  const animals = Array.isArray(pen?.animals) ? pen.animals : [];
  const animalProductIds = Array.isArray(config.animalProductIds) ? config.animalProductIds : [];
  const slotInfo = getAnimalSlotInfo(animalProductIds[0]);
  const slots = [
    ...animals.map((animal, index) => renderAnimalSlot(config, animal, index)),
    ...animalProductIds.map((productId, index) => renderAnimalSlot(config, null, animals.length + index, productId)),
  ];

  return `
    <section class="building-window-section building-window-section--animals" ${config.animalDropAttribute}>
      <div class="building-window-section__title">
        <span>Animal slots</span>
        <span class="building-window-section__meta">${slotInfo.animals}/${slotInfo.slots}</span>
      </div>
      <div class="building-animal-grid">
        ${slots.join("")}
      </div>
    </section>
  `;
}

function renderAnimalWindow(config) {
  const summary = getAnimalBuildingSummary(config.id);

  return `
    <div class="building-window-backdrop" data-building-window-backdrop>
      <section class="building-window" data-building-window="${config.id}" role="dialog" aria-modal="true" aria-label="${config.title}">
        <header class="building-window-header">
          <span class="building-window-title">
            <span class="building-window-title__icon" aria-hidden="true">${config.icon}</span>
            <span>${config.title}</span>
          </span>
          <button type="button" class="building-window-close" data-building-window-close aria-label="Close">x</button>
        </header>
        <div class="building-window-summary">
          <span>${config.animalLabel || "Animals"} x${summary.animalCount}</span>
          <span>${summary.status}</span>
        </div>
        <div class="building-window-body">
          <div class="building-window-column building-window-column--food">
            ${renderFoodControls(config)}
          </div>
          <div class="building-window-column building-window-column--animals">
            ${renderAnimalSlots(config)}
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderFeederFoodRows() {
  return FEEDER_FOOD_ROWS.map((row) => {
    const product = getProduct(row.productId);
    const pen = state[row.penKey];
    const storedQuantity = pen?.food?.[row.productId] || 0;
    const barnQuantity = getBarnItemQuantity(row.productId);
    return `
      <div class="building-feeder-food-row">
        <span class="building-feeder-food-row__item">
          <span aria-hidden="true">${product?.icon || ""}</span>
          <span>${product?.marketName || "Food"}</span>
        </span>
        <span>${row.label}</span>
        <span>Barn x${formatQuantity(barnQuantity)}</span>
        <span>Stored x${formatQuantity(storedQuantity)}</span>
      </div>
    `;
  }).join("");
}

function renderFeederWindow() {
  const slots = getAnimalFeederSlots();
  const summary = getAnimalFeederSummary();

  return `
    <div class="building-window-backdrop" data-building-window-backdrop>
      <section class="building-window" data-building-window="animalFeeder" role="dialog" aria-modal="true" aria-label="Animal feeder">
        <header class="building-window-header">
          <span class="building-window-title">
            <span class="building-window-title__icon" aria-hidden="true">🪣</span>
            <span>Animal Feeder</span>
          </span>
          <button type="button" class="building-window-close" data-building-window-close aria-label="Close">x</button>
        </header>
        <div class="building-window-summary">
          <span>Auto targets x${summary.enabledCount}</span>
          <span>${summary.status}</span>
        </div>
        <div class="building-window-body building-window-body--feeder">
          <div class="building-window-column building-window-column--food">
            <section class="building-window-section">
              <div class="building-window-section__title">Food overview</div>
              <div class="building-feeder-food-grid">
                ${renderFeederFoodRows()}
              </div>
            </section>
          </div>
          <div class="building-window-column building-window-column--animals">
            <section class="building-window-section">
              <div class="building-window-section__title">Automatic pull from barn</div>
              <div class="building-feeder-targets">
                ${slots.map((slot) => `
                  <button type="button" class="building-feeder-target ${slot.enabled ? "is-selected" : ""}" data-building-feeder-target="${slot.id}" aria-pressed="${slot.enabled ? "true" : "false"}">
                    <span class="building-feeder-target__name">${slot.label}</span>
                    <span class="building-feeder-target__status">${slot.enabled ? slot.status : "Disabled"}</span>
                  </button>
                `).join("")}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderActiveWindow() {
  if (!activeBuildingId || !root) {
    return;
  }

  const previousFoodAmount = root.querySelector("[data-building-food-amount]")?.value || "";
  const config = BUILDING_CONFIGS[activeBuildingId];
  if (config) {
    root.innerHTML = renderAnimalWindow(config);
    const nextInput = root.querySelector("[data-building-food-amount]");
    if (nextInput && previousFoodAmount) {
      nextInput.value = previousFoodAmount;
    }
    return;
  }

  if (activeBuildingId === "animalFeeder") {
    root.innerHTML = renderFeederWindow();
  }
}

export function openAnimalBuildingWindow(buildingId) {
  activeBuildingId = buildingId;
  ensureRoot();
  renderActiveWindow();
}

export function closeAnimalBuildingWindow() {
  activeBuildingId = null;
  if (root) {
    root.innerHTML = "";
  }
}

function handleWindowClick(event) {
  const closeButton = event.target.closest("[data-building-window-close]");
  const backdrop = event.target.closest("[data-building-window-backdrop]");
  if (closeButton || (backdrop && event.target === backdrop)) {
    closeAnimalBuildingWindow();
    return;
  }

  const windowElement = event.target.closest("[data-building-window]");
  if (!windowElement) {
    return;
  }

  const config = BUILDING_CONFIGS[windowElement.dataset.buildingWindow];
  const foodAction = event.target.closest("[data-building-food-action]");
  if (config && foodAction) {
    const foodRow = foodAction.closest(".building-food-row") || windowElement;
    const amount = getAmount(foodRow);
    const productId = foodAction.dataset.buildingFoodProduct;
    if (foodAction.dataset.buildingFoodAction === "add") {
      config.addFood(productId, amount);
    } else {
      config.removeFood(productId, amount);
    }
    return;
  }

  const addAnimalButton = event.target.closest("[data-building-add-animal]");
  if (addAnimalButton) {
    addAnimalToPen(addAnimalButton.dataset.buildingAddAnimal);
    return;
  }

  const feederTarget = event.target.closest("[data-building-feeder-target]");
  if (feederTarget) {
    toggleAnimalFeederTarget(feederTarget.dataset.buildingFeederTarget);
  }
}

function handleWindowContextMenu(event) {
  const animalSlot = event.target.closest("[data-building-animal-id]");
  if (!animalSlot || !activeBuildingId) {
    return;
  }

  event.preventDefault();
  returnAnimalFromPen(activeBuildingId, animalSlot.dataset.buildingAnimalId);
}

function handleWindowInput(event) {
  if (!event.target.matches("[data-building-food-amount]")) {
    return;
  }

  const value = Math.max(1, Math.floor(Number(event.target.value) || 1));
  event.target.value = String(value);
}

function updateActiveAnimalProgress() {
  if (!activeBuildingId || !root) {
    return;
  }

  const config = BUILDING_CONFIGS[activeBuildingId];
  if (!config) {
    return;
  }

  const pen = state[config.penKey];
  const animals = Array.isArray(pen?.animals) ? pen.animals : [];

  for (const animal of animals) {
    const slot = root.querySelector(`[data-building-animal-id="${animal.id}"]`);
    if (!slot) {
      continue;
    }

    const progress = getProductionProgress(animal);
    const animalProduct = getProduct(animal.productId);
    const outputProduct = animalProduct?.outputProductId ? getProduct(animalProduct.outputProductId) : null;
    const status = slot.querySelector(".building-animal-slot__status");
    const progressFill = slot.querySelector(".building-animal-slot__progress-fill");
    if (status) {
      status.textContent = getAnimalStatus(animal, outputProduct);
    }
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeBuildingId) {
    closeAnimalBuildingWindow();
  }
});

document.addEventListener("pointerdown", (event) => {
  if (!activeBuildingId) {
    return;
  }

  if (!event.target.closest("[data-building-window]")) {
    closeAnimalBuildingWindow();
  }
}, { capture: true });

onStateChange(renderActiveWindow);
onProgressChange(updateActiveAnimalProgress);
