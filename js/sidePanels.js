import { ANIMAL_ITEMS } from "./animals.js";
import { MATERIALS, getProduct, getProductSellPrice, sortProductsByBuyPrice, sortProductsByCoinValue } from "./catalog.js";
import { attachSeedInfoTooltip } from "./seedInfoTooltip.js";
import { CROP_ITEMS } from "./seeds.js";
import { addProductToSellStand, getSellCellFromPoint } from "./sell.js";
import { getAnimalPenDropTargetFromPoint } from "./animalPen.js";
import { getChickenCoopDropTargetFromPoint } from "./chickenCoop.js";
import {
  addAnimalFoodToPen,
  addAnimalToPen,
  addChickenFoodToCoop,
  addShoppingItem,
  bakeBread,
  buildAnimalFeeder,
  buildAnimalPen,
  buildBakery,
  buildChickenCoop,
  buildMill,
  buyLandPlot,
  canBuildAnimalFeeder,
  canBuildAnimalPen,
  canBuildBakery,
  canBuildChickenCoop,
  canBuildMill,
  getBarnItemQuantity,
  getNextLandPlotCost,
  getShoppingListTotal,
  isBuildingBuilt,
  millWheatToFlour,
  onStateChange,
  purchaseShoppingList,
  removeShoppingItem,
  state,
} from "./state.js";
import { getInventoryEntries } from "./inventory.js";
import { renderEmpty, renderSection } from "./pageShared.js";

const SWITCH_ANIMATION_MS = 180;
const BASKET_START_POSITION = { left: 540, top: 92 };
const BARN_DRAG_THRESHOLD = 4;
const PANEL_TITLES = {
  barn: "Barn",
  shop: "Shop",
  build: "Build",
};

const CATEGORY_ORDER = ["seeds", "crops", "materials", "processed", "animals"];
const BARN_SORTS = [
  { key: "category", label: "Category" },
  { key: "alphabetical", label: "A-Z" },
  { key: "sellValue", label: "Sell value" },
  { key: "quantity", label: "Amount" },
];

const SHOP_SECTIONS = [
  { key: "seeds", title: "Seeds", products: () => CROP_ITEMS.map(({ seed }) => seed).sort(sortProductsByBuyPrice) },
  { key: "animals", title: "Animals", products: () => ANIMAL_ITEMS.map(({ animal }) => animal).sort(sortProductsByBuyPrice) },
  { key: "materials", title: "Materials", products: () => Object.values(MATERIALS).sort(sortProductsByBuyPrice) },
  { key: "farm", title: "Farm", products: () => [] },
];

let activePanel = null;
let switchTimer = null;
let barnSortIndex = 0;
let isBasketOpen = false;
let basketPosition = { ...BASKET_START_POSITION };
let basketDrag = null;
let barnItemDrag = null;
let sidePanelTooltip = null;
const collapsedSections = new Set();

function getCategoryClass(product) {
  return `item-category-${product?.category || "other"}`;
}

function getCategoryOrder(product) {
  const index = CATEGORY_ORDER.indexOf(product?.category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function getDisplayName(product) {
  if (product?.category === "seeds") {
    return (product.marketName || product.inventoryName || "").replace(/\s+seed$/i, "");
  }
  return product?.marketName || product?.inventoryName || "Item";
}

function isBarnSellableProduct(product) {
  return Boolean(product && (product.category === "crops" || product.category === "processed") && getProductSellPrice(product.id) > 0);
}

function isBarnDraggableProduct(product) {
  return Boolean(product && ["animals", "crops", "processed"].includes(product.category));
}

function getBarnItemTypeText(product) {
  if (product?.category === "seeds") {
    return "Seed";
  }

  if (product?.category === "crops") {
    return "Crop";
  }

  return "";
}

function sectionOpen(sectionKey) {
  return collapsedSections.has(`${sectionKey}:open`);
}

function renderCollapsibleSection(panelKey, sectionKey, title, body, className = "") {
  const key = `${panelKey}:${sectionKey}`;
  return renderSection(title, body, className, {
    collapsible: true,
    open: sectionOpen(key),
    sectionKey: key,
  });
}

function getShoppingEntries() {
  return Object.entries(state.shopping.items)
    .map(([productId, quantity]) => {
      const product = getProduct(productId);
      return product && quantity > 0 ? { product, quantity } : null;
    })
    .filter(Boolean)
    .sort((first, second) => sortProductsByBuyPrice(first.product, second.product));
}

function getBarnSellDropTargetFromPoint(x, y) {
  const element = document.elementFromPoint(x, y);
  return element?.closest?.("[data-barn-sell-drop]") || null;
}

function getSortedBarnEntries() {
  const sortMode = BARN_SORTS[barnSortIndex].key;
  const entries = getInventoryEntries();

  return entries.sort((first, second) => {
    if (sortMode === "category") {
      return getCategoryOrder(first.product) - getCategoryOrder(second.product)
        || sortProductsByCoinValue(first.product, second.product);
    }

    if (sortMode === "alphabetical") {
      return getDisplayName(first.product).localeCompare(getDisplayName(second.product));
    }

    if (sortMode === "sellValue") {
      return getProductSellPrice(first.product.id) - getProductSellPrice(second.product.id)
        || getDisplayName(first.product).localeCompare(getDisplayName(second.product));
    }

    return second.quantity - first.quantity
      || getDisplayName(first.product).localeCompare(getDisplayName(second.product));
  });
}

function renderInventoryTile(product, value, { isButton = false, buttonAttribute = "", className = "", detail = "" } = {}) {
  const tag = isButton ? "button" : "div";
  const typeAttribute = isButton ? 'type="button"' : "";
  return `
    <${tag}
      ${typeAttribute}
      class="panel-item-tile ${isButton ? "panel-item-tile--button" : ""} ${className} ${getCategoryClass(product)}"
      ${buttonAttribute}
      data-item-info-product="${product.id}"
    >
      <span class="panel-item-tile__bar" aria-hidden="true"></span>
      <span class="panel-item-tile__name">${getDisplayName(product)}</span>
      ${detail ? `<span class="panel-item-tile__detail">${detail}</span>` : ""}
      <span class="panel-item-tile__value">${value}</span>
    </${tag}>
  `;
}

function renderBarnPanel() {
  const entries = getSortedBarnEntries();
  const sort = BARN_SORTS[barnSortIndex];
  return `
    <div class="barn-panel-toolbar">
      <button type="button" class="page-action barn-sort-button" data-barn-sort>Sort: ${sort.label}</button>
      <button
        type="button"
        class="barn-send-to-market"
        data-barn-sell-drop
        aria-label="Send to market"
        title="Drop sellable barn items here"
      >
        <span class="barn-send-to-market__icon" aria-hidden="true">↗</span>
        <span class="barn-send-to-market__label">Send to market</span>
      </button>
    </div>
    ${
      entries.length > 0
        ? `<div class="panel-item-grid">${entries
            .map(({ product, quantity }) => renderInventoryTile(product, `x${quantity}`, {
              buttonAttribute: isBarnDraggableProduct(product) ? `data-barn-drag-product="${product.id}"` : "",
              className: isBarnDraggableProduct(product) ? "panel-item-tile--draggable" : "",
              detail: getBarnItemTypeText(product),
            }))
            .join("")}</div>`
        : renderEmpty()
    }
  `;
}

function renderShoppingList() {
  const entries = getShoppingEntries();
  const total = getShoppingListTotal();
  const remainingCoins = Math.max(0, state.coins - total);
  const body = entries.length > 0
    ? `
      <div class="page-list">
        ${entries
          .map(({ product, quantity }) => `
            <div class="page-list-row" data-item-info-product="${product.id}">
              <span>${product.marketName} x${quantity}</span>
              <button type="button" class="page-action page-action--small" data-shop-remove="${product.id}">-</button>
            </div>
          `)
          .join("")}
      </div>
      <button type="button" class="shopping-purchase" data-shop-purchase>Purchase ${total} | ${remainingCoins} left</button>
    `
    : renderEmpty("Basket empty");

  return `
    <div class="basket-cell__content">
      ${body}
    </div>
  `;
}

function renderShopSection(section) {
  if (section.key === "farm") {
    const cost = getNextLandPlotCost();
    const body = `
      <div class="panel-item-grid">
        <button type="button" class="panel-item-tile panel-item-tile--button item-category-farm" data-buy-land-plot data-item-info-product="">
          <span class="panel-item-tile__bar" aria-hidden="true"></span>
          <span class="panel-item-tile__name">Land plot</span>
          <span class="panel-item-tile__value">${cost}</span>
        </button>
      </div>
    `;
    return renderCollapsibleSection("shop", section.key, section.title, body);
  }

  const products = section.products();
  const body = products.length > 0
    ? `<div class="panel-item-grid">${products
        .map((product) => renderInventoryTile(product, product.price, {
          isButton: true,
          buttonAttribute: `data-shop-buy="${product.id}"`,
        }))
        .join("")}</div>`
    : renderEmpty();

  return renderCollapsibleSection("shop", section.key, section.title, body);
}

function renderShopPanel() {
  return `
    <div class="shop-panel-layout">
      <div class="shop-panel-main">
        ${SHOP_SECTIONS.map(renderShopSection).join("")}
      </div>
    </div>
  `;
}

function getBuildSections() {
  const wood = getBarnItemQuantity("wood");
  const nails = getBarnItemQuantity("nails");
  return [
    {
      key: "production",
      title: "Production",
      options: [
        {
          id: "bakery",
          label: "Bakery",
          built: isBuildingBuilt("bakery"),
          canBuild: canBuildBakery(),
          cost: `Wood ${wood}/75 - Nails ${nails}/25`,
        },
        {
          id: "mill",
          label: "Mill",
          built: isBuildingBuilt("mill"),
          canBuild: canBuildMill(),
          cost: `Wood ${wood}/35`,
        },
      ],
    },
    {
      key: "animals",
      title: "Animals",
      options: [
        {
          id: "chickenCoop",
          label: "Chicken Coop",
          built: isBuildingBuilt("chickenCoop"),
          canBuild: canBuildChickenCoop(),
          cost: `Wood ${wood}/25`,
        },
        {
          id: "animalPen",
          label: "Cow Pen",
          built: isBuildingBuilt("animalPen"),
          canBuild: canBuildAnimalPen(),
          cost: `Wood ${wood}/55`,
        },
        {
          id: "animalFeeder",
          label: "Animal Feeder",
          built: isBuildingBuilt("animalFeeder"),
          canBuild: canBuildAnimalFeeder(),
          cost: `Wood ${wood}/125 - Nails ${nails}/25`,
        },
      ],
    },
  ];
}

function renderBuildOption(option) {
  const status = option.built ? "Built" : option.canBuild ? "Ready" : "Need materials";
  return `
    <button type="button" class="page-item page-item--button build-option-cell ${option.built ? "is-built" : ""}" data-build-page="${option.id}">
      <div class="page-item__main">
        <span class="page-item__name">${option.label}</span>
        <span class="page-item__meta">${option.cost}</span>
      </div>
      <span class="build-option-status">${status}</span>
    </button>
  `;
}

function renderBuildPanel() {
  return getBuildSections()
    .map((section) => renderCollapsibleSection("build", section.key, section.title, `
      <div class="page-item-grid build-option-grid">
        ${section.options.map(renderBuildOption).join("")}
      </div>
    `))
    .join("");
}

function renderPanelContent(panelKey) {
  const renderers = {
    barn: renderBarnPanel,
    shop: renderShopPanel,
    build: renderBuildPanel,
  };
  return renderers[panelKey]?.() || "";
}

function updateTabs(tabRoot, panelKey) {
  tabRoot.querySelectorAll("[data-side-tab]").forEach((button) => {
    const isActive = Boolean(panelKey && button.dataset.sideTab === panelKey);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function renderActivePanel(panelRoot, contentRoot, titleRoot, tabRoot) {
  if (!activePanel) {
    return;
  }

  panelRoot.dataset.activePanel = activePanel;
  titleRoot.textContent = PANEL_TITLES[activePanel];
  contentRoot.innerHTML = renderPanelContent(activePanel);
  panelRoot.classList.add("is-open");
  panelRoot.setAttribute("aria-hidden", "false");
  updateTabs(tabRoot, activePanel);
}

function renderBasketCell(basketRoot) {
  if (!basketRoot) {
    return;
  }

  basketRoot.innerHTML = `
    <div class="basket-cell__header" data-basket-drag-handle>
      <span class="basket-cell__title">Basket</span>
    </div>
    ${renderShoppingList()}
  `;
}

function updateBasketVisibility(basketRoot, basketButton) {
  const shouldShowButton = activePanel === "shop";
  if (basketButton) {
    basketButton.hidden = !shouldShowButton;
    basketButton.classList.toggle("is-active", shouldShowButton && isBasketOpen);
    basketButton.setAttribute("aria-expanded", shouldShowButton && isBasketOpen ? "true" : "false");
    basketButton.setAttribute("aria-label", shouldShowButton && isBasketOpen ? "Hide basket" : "Show basket");
  }

  if (!basketRoot) {
    return;
  }

  const shouldShowBasket = shouldShowButton && isBasketOpen;
  basketRoot.hidden = !shouldShowBasket;
  basketRoot.classList.toggle("is-visible", shouldShowBasket);
  basketRoot.style.left = `${basketPosition.left}px`;
  basketRoot.style.top = `${basketPosition.top}px`;
  if (shouldShowBasket) {
    renderBasketCell(basketRoot);
  }
}

function openBasket(basketRoot, basketButton) {
  isBasketOpen = true;
  updateBasketVisibility(basketRoot, basketButton);
}

function closePanel(panelRoot, tabRoot, basketRoot, basketButton) {
  activePanel = null;
  isBasketOpen = false;
  window.clearTimeout(switchTimer);
  delete panelRoot.dataset.activePanel;
  panelRoot.classList.remove("is-open");
  panelRoot.setAttribute("aria-hidden", "true");
  updateTabs(tabRoot, null);
  updateBasketVisibility(basketRoot, basketButton);
}

function openPanel(panelKey, panelRoot, contentRoot, titleRoot, tabRoot, basketRoot, basketButton) {
  window.clearTimeout(switchTimer);
  if (activePanel === panelKey && panelRoot.classList.contains("is-open")) {
    closePanel(panelRoot, tabRoot, basketRoot, basketButton);
    return;
  }

  if (activePanel && activePanel !== panelKey && panelRoot.classList.contains("is-open")) {
    panelRoot.classList.remove("is-open");
    activePanel = panelKey;
    if (panelKey !== "shop") {
      isBasketOpen = false;
    }
    updateTabs(tabRoot, panelKey);
    updateBasketVisibility(basketRoot, basketButton);
    switchTimer = window.setTimeout(() => {
      renderActivePanel(panelRoot, contentRoot, titleRoot, tabRoot);
      updateBasketVisibility(basketRoot, basketButton);
    }, SWITCH_ANIMATION_MS);
    return;
  }

  activePanel = panelKey;
  if (panelKey !== "shop") {
    isBasketOpen = false;
  }
  renderActivePanel(panelRoot, contentRoot, titleRoot, tabRoot);
  updateBasketVisibility(basketRoot, basketButton);
}

function handlePanelAction(event, basketRoot = null, basketButton = null) {
  if (event.target.closest("[data-barn-sort]")) {
    barnSortIndex = (barnSortIndex + 1) % BARN_SORTS.length;
    event.currentTarget.innerHTML = renderBarnPanel();
    return;
  }

  const removeShoppingButton = event.target.closest("[data-shop-remove]");
  if (removeShoppingButton) {
    removeShoppingItem(removeShoppingButton.dataset.shopRemove);
    return;
  }

  if (event.target.closest("[data-shop-purchase]")) {
    purchaseShoppingList();
    return;
  }

  if (event.target.closest("[data-buy-land-plot]")) {
    buyLandPlot();
    return;
  }

  const buyCell = event.target.closest("[data-shop-buy]");
  if (buyCell) {
    addShoppingItem(buyCell.dataset.shopBuy);
    openBasket(basketRoot, basketButton);
    return;
  }

  const buildButton = event.target.closest("[data-build-page]");
  if (!buildButton) {
    return;
  }

  const actions = {
    bakery: buildBakery,
    mill: buildMill,
    chickenCoop: buildChickenCoop,
    animalPen: buildAnimalPen,
    animalFeeder: buildAnimalFeeder,
  };
  actions[buildButton.dataset.buildPage]?.();
}

function handleBasketAction(event) {
  const removeShoppingButton = event.target.closest("[data-shop-remove]");
  if (removeShoppingButton) {
    removeShoppingItem(removeShoppingButton.dataset.shopRemove);
    return;
  }

  if (event.target.closest("[data-shop-purchase]")) {
    purchaseShoppingList();
  }
}

function getBasketBounds(element) {
  return {
    maxLeft: Math.max(0, window.innerWidth - element.offsetWidth),
    maxTop: Math.max(0, window.innerHeight - element.offsetHeight),
  };
}

function clampBasketPosition(element, left, top) {
  const bounds = getBasketBounds(element);
  return {
    left: Math.min(bounds.maxLeft, Math.max(0, left)),
    top: Math.min(bounds.maxTop, Math.max(0, top)),
  };
}

function handleBasketPointerDown(event) {
  const basketRoot = event.currentTarget;
  if (event.button !== 0 || !event.target.closest("[data-basket-drag-handle]")) {
    return;
  }

  event.preventDefault();
  basketDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startLeft: basketPosition.left,
    startTop: basketPosition.top,
  };
  basketRoot.classList.add("is-dragging");
  try {
    basketRoot.setPointerCapture(event.pointerId);
  } catch {
    // Best effort.
  }
}

function handleBasketPointerMove(event) {
  if (!basketDrag || event.pointerId !== basketDrag.pointerId) {
    return;
  }

  const basketRoot = event.currentTarget;
  basketPosition = clampBasketPosition(
    basketRoot,
    basketDrag.startLeft + event.clientX - basketDrag.startX,
    basketDrag.startTop + event.clientY - basketDrag.startY
  );
  basketRoot.style.left = `${basketPosition.left}px`;
  basketRoot.style.top = `${basketPosition.top}px`;
  event.preventDefault();
}

function handleBasketPointerUp(event) {
  if (!basketDrag || event.pointerId !== basketDrag.pointerId) {
    return;
  }

  const basketRoot = event.currentTarget;
  basketRoot.classList.remove("is-dragging");
  try {
    basketRoot.releasePointerCapture(event.pointerId);
  } catch {
    // Best effort.
  }
  basketDrag = null;
}

function clearBarnItemDrag() {
  if (!barnItemDrag) {
    return;
  }

  window.removeEventListener("pointermove", handleBarnItemPointerMove);
  window.removeEventListener("pointerup", handleBarnItemPointerUp);
  window.removeEventListener("pointercancel", handleBarnItemPointerCancel);
  barnItemDrag.tile.classList.remove("is-dragging");
  document.body.classList.remove("is-dragging-cell");

  try {
    barnItemDrag.tile.releasePointerCapture(barnItemDrag.pointerId);
  } catch {
    // Best effort.
  }

  if (barnItemDrag.ghost) {
    barnItemDrag.ghost.remove();
  }

  barnItemDrag = null;
}

function createBarnItemGhost(tile) {
  const rect = tile.getBoundingClientRect();
  const ghost = tile.cloneNode(true);
  ghost.classList.remove("is-dragging");
  ghost.classList.add("panel-item-tile--ghost");
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.position = "fixed";
  ghost.style.left = `${rect.left}px`;
  ghost.style.top = `${rect.top}px`;
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  ghost.style.pointerEvents = "none";
  ghost.style.margin = "0";
  ghost.style.zIndex = "5000";
  document.body.append(ghost);
  return ghost;
}

function getBuildingElementFromPoint(x, y, selector) {
  return document.elementFromPoint(x, y)?.closest?.(selector) || null;
}

function dropBarnItemIntoBuilding(productId, x, y) {
  const product = getProduct(productId);
  if (!product) {
    return false;
  }

  const animalPenDropTarget = getAnimalPenDropTargetFromPoint(x, y);
  if (animalPenDropTarget === "food") {
    return addAnimalFoodToPen(productId, 1);
  }

  if (animalPenDropTarget === "animals") {
    return product.penBuildingId === "animalPen" ? addAnimalToPen(productId) : false;
  }

  const chickenCoopDropTarget = getChickenCoopDropTargetFromPoint(x, y);
  if (chickenCoopDropTarget === "food") {
    return addChickenFoodToCoop(productId, 1);
  }

  if (chickenCoopDropTarget === "animals") {
    return product.penBuildingId === "chickenCoop" ? addAnimalToPen(productId) : false;
  }

  if (getBuildingElementFromPoint(x, y, "[data-mill-cell]")) {
    if (productId === "wheatCrop") {
      return millWheatToFlour();
    }
    return false;
  }

  if (getBuildingElementFromPoint(x, y, "[data-bakery-cell]")) {
    if (productId === "flour") {
      return bakeBread();
    }
    return false;
  }

  return false;
}

function handleBarnItemPointerDown(event) {
  const tile = event.target.closest("[data-barn-drag-product]");
  if (!tile || event.button !== 0) {
    return;
  }

  const productId = tile.dataset.barnDragProduct;
  const product = getProduct(productId);
  if (!isBarnDraggableProduct(product)) {
    return;
  }

  const rect = tile.getBoundingClientRect();
  barnItemDrag = {
    productId,
    tile,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startLeft: rect.left,
    startTop: rect.top,
    dragged: false,
    ghost: null,
  };

  try {
    tile.setPointerCapture(event.pointerId);
  } catch {
    // Best effort.
  }

  window.addEventListener("pointermove", handleBarnItemPointerMove, { passive: false });
  window.addEventListener("pointerup", handleBarnItemPointerUp);
  window.addEventListener("pointercancel", handleBarnItemPointerCancel);
}

function handleBarnItemPointerMove(event) {
  if (!barnItemDrag || event.pointerId !== barnItemDrag.pointerId) {
    return;
  }

  const deltaX = event.clientX - barnItemDrag.startX;
  const deltaY = event.clientY - barnItemDrag.startY;
  if (!barnItemDrag.dragged && Math.hypot(deltaX, deltaY) < BARN_DRAG_THRESHOLD) {
    return;
  }

  if (!barnItemDrag.dragged) {
    barnItemDrag.dragged = true;
    sidePanelTooltip?.hide();
    barnItemDrag.ghost = createBarnItemGhost(barnItemDrag.tile);
    barnItemDrag.tile.classList.add("is-dragging");
    document.body.classList.add("is-dragging-cell");
  }

  if (barnItemDrag.ghost) {
    barnItemDrag.ghost.style.left = `${barnItemDrag.startLeft + deltaX}px`;
    barnItemDrag.ghost.style.top = `${barnItemDrag.startTop + deltaY}px`;
  }

  event.preventDefault();
}

function handleBarnItemPointerUp(event) {
  if (!barnItemDrag || event.pointerId !== barnItemDrag.pointerId) {
    return;
  }

  const snapshot = barnItemDrag;
  const wasDragged = snapshot.dragged;
  clearBarnItemDrag();

  if (!wasDragged) {
    return;
  }

  if (dropBarnItemIntoBuilding(snapshot.productId, event.clientX, event.clientY)) {
    event.preventDefault();
    return;
  }

  const product = getProduct(snapshot.productId);
  if (isBarnSellableProduct(product) && getBarnSellDropTargetFromPoint(event.clientX, event.clientY)) {
    addProductToSellStand(snapshot.productId);
    event.preventDefault();
    return;
  }

  if (isBarnSellableProduct(product) && getSellCellFromPoint(event.clientX, event.clientY)) {
    addProductToSellStand(snapshot.productId);
  }

  event.preventDefault();
}

function handleBarnItemPointerCancel() {
  clearBarnItemDrag();
}

function handlePanelKeydown(event, basketRoot = null, basketButton = null) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  if (event.target.closest("[data-buy-land-plot]")) {
    event.preventDefault();
    buyLandPlot();
    return;
  }

  const buyCell = event.target.closest("[data-shop-buy]");
  if (!buyCell) {
    return;
  }

  event.preventDefault();
  addShoppingItem(buyCell.dataset.shopBuy);
  openBasket(basketRoot, basketButton);
}

export function mountSidePanels() {
  const tabRoot = document.querySelector("[data-side-tabs]");
  const panelRoot = document.querySelector("[data-side-panel]");
  const contentRoot = document.querySelector("[data-side-panel-content]");
  const titleRoot = document.querySelector("[data-side-panel-title]");
  const headerRoot = titleRoot?.closest(".side-panel-header");
  if (!tabRoot || !panelRoot || !contentRoot || !titleRoot || !headerRoot) {
    return;
  }

  const basketButton = document.createElement("button");
  basketButton.type = "button";
  basketButton.className = "basket-toggle";
  basketButton.dataset.basketToggle = "";
  basketButton.hidden = true;
  basketButton.setAttribute("aria-label", "Show basket");
  basketButton.setAttribute("aria-expanded", "false");
  basketButton.textContent = "🧺";
  headerRoot.append(basketButton);

  const basketRoot = document.createElement("aside");
  basketRoot.className = "basket-cell";
  basketRoot.dataset.basketCell = "";
  basketRoot.hidden = true;
  basketRoot.setAttribute("aria-label", "Basket");
  document.querySelector(".scene")?.append(basketRoot);

  sidePanelTooltip = attachSeedInfoTooltip(contentRoot);
  updateTabs(tabRoot, null);
  updateBasketVisibility(basketRoot, basketButton);

  tabRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-side-tab]");
    if (!button) {
      return;
    }

    openPanel(button.dataset.sideTab, panelRoot, contentRoot, titleRoot, tabRoot, basketRoot, basketButton);
  });

  basketButton.addEventListener("click", () => {
    isBasketOpen = !isBasketOpen;
    updateBasketVisibility(basketRoot, basketButton);
  });

  basketRoot.addEventListener("click", handleBasketAction);
  basketRoot.addEventListener("pointerdown", handleBasketPointerDown);
  basketRoot.addEventListener("pointermove", handleBasketPointerMove);
  basketRoot.addEventListener("pointerup", handleBasketPointerUp);
  basketRoot.addEventListener("pointercancel", handleBasketPointerUp);

  contentRoot.addEventListener("click", (event) => handlePanelAction(event, basketRoot, basketButton));
  contentRoot.addEventListener("keydown", (event) => handlePanelKeydown(event, basketRoot, basketButton));
  contentRoot.addEventListener("pointerdown", handleBarnItemPointerDown);
  contentRoot.addEventListener("toggle", (event) => {
    const section = event.target.closest?.("[data-section-key]");
    if (!section) {
      return;
    }

    if (section.open) {
      collapsedSections.add(`${section.dataset.sectionKey}:open`);
      return;
    }

    collapsedSections.delete(`${section.dataset.sectionKey}:open`);
  }, true);

  document.addEventListener("pointerdown", (event) => {
    if (!activePanel) {
      return;
    }

    const interactiveElement = event.target.closest(
      "[data-top-info-panel], [data-side-panel], [data-side-tabs], [data-basket-cell], [data-cell-key], [data-delete-zone], [data-restart-farm], button, summary, input, textarea, select, a, label"
    );
    if (interactiveElement) {
      return;
    }

    closePanel(panelRoot, tabRoot, basketRoot, basketButton);
  }, { capture: true });

  onStateChange(() => {
    renderActivePanel(panelRoot, contentRoot, titleRoot, tabRoot);
    updateBasketVisibility(basketRoot, basketButton);
  });
}
