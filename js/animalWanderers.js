import { getProduct } from "./catalog.js";
import { isBuildingBuilt, onStateChange, state } from "./state.js";

const WANDER_INTERVAL_MS = 3400;
const BUILDING_SIZE = {
  animalPen: { width: 176, height: 96 },
  chickenCoop: { width: 176, height: 96 },
  beehive: { width: 176, height: 96 },
};
const WANDER_CONFIG = {
  animalPen: { radiusX: 170, radiusY: 112, size: 34 },
  chickenCoop: { radiusX: 138, radiusY: 88, size: 26 },
  beehive: { radiusX: 118, radiusY: 78, size: 20 },
};

const wanderers = new Map();
let layer = null;
let timer = null;

function hashText(text) {
  return Array.from(String(text)).reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);
}

function getWandererKey(buildingId, animal) {
  return `${buildingId}:${animal.id}`;
}

function createOffset(buildingId, animal, index) {
  const config = WANDER_CONFIG[buildingId];
  const hash = hashText(`${buildingId}:${animal.id}:${index}`);
  const angle = ((hash % 360) / 180) * Math.PI;
  const distance = 0.36 + ((hash % 47) / 100);

  return {
    x: Math.cos(angle) * config.radiusX * distance,
    y: Math.sin(angle) * config.radiusY * distance,
  };
}

function nudgeOffset(offset, buildingId) {
  const config = WANDER_CONFIG[buildingId];
  return {
    x: Math.max(-config.radiusX, Math.min(config.radiusX, offset.x + (Math.random() - 0.5) * 76)),
    y: Math.max(-config.radiusY, Math.min(config.radiusY, offset.y + (Math.random() - 0.5) * 54)),
  };
}

function getAnimalEntries() {
  const entries = [];
  if (isBuildingBuilt("animalPen")) {
    state.animalPen.animals.forEach((animal, index) => entries.push({ buildingId: "animalPen", animal, index }));
  }
  if (isBuildingBuilt("chickenCoop")) {
    state.chickenCoop.animals.forEach((animal, index) => entries.push({ buildingId: "chickenCoop", animal, index }));
  }
  if (isBuildingBuilt("beehive")) {
    state.beehive.animals.forEach((animal, index) => entries.push({ buildingId: "beehive", animal, index }));
  }
  return entries;
}

function getBuildingCenter(buildingId) {
  const position = state.cells[buildingId];
  const size = BUILDING_SIZE[buildingId];
  return {
    x: (position?.left || 0) + size.width / 2,
    y: (position?.top || 0) + size.height / 2,
  };
}

function syncWanderers() {
  const activeKeys = new Set();
  for (const entry of getAnimalEntries()) {
    const key = getWandererKey(entry.buildingId, entry.animal);
    activeKeys.add(key);
    if (!wanderers.has(key)) {
      wanderers.set(key, {
        offset: createOffset(entry.buildingId, entry.animal, entry.index),
      });
    }
  }

  for (const key of wanderers.keys()) {
    if (!activeKeys.has(key)) {
      wanderers.get(key)?.element?.remove();
      wanderers.delete(key);
    }
  }
}

function moveWanderers() {
  for (const entry of getAnimalEntries()) {
    const key = getWandererKey(entry.buildingId, entry.animal);
    const wanderer = wanderers.get(key);
    if (!wanderer) {
      continue;
    }
    wanderer.offset = nudgeOffset(wanderer.offset, entry.buildingId);
  }
  render();
}

function render() {
  if (!layer) {
    return;
  }

  syncWanderers();
  layer.parentElement?.appendChild(layer);
  const entries = getAnimalEntries();
  for (const { buildingId, animal } of entries) {
    const key = getWandererKey(buildingId, animal);
    const wanderer = wanderers.get(key);
    const product = getProduct(animal.productId);
    const center = getBuildingCenter(buildingId);
    const config = WANDER_CONFIG[buildingId];
    const left = center.x + (wanderer?.offset.x || 0) - config.size / 2;
    const top = center.y + (wanderer?.offset.y || 0) - config.size / 2;

    if (!wanderer.element) {
      wanderer.element = document.createElement("div");
      wanderer.element.className = `animal-wanderer animal-wanderer--${product?.id || "animal"}`;
      wanderer.element.setAttribute("aria-hidden", "true");
      wanderer.element.innerHTML = `<span class="animal-wanderer__icon">${product?.icon || "."}</span>`;
      layer.appendChild(wanderer.element);
    }

    wanderer.element.style.setProperty("--animal-size", `${config.size}px`);
    wanderer.element.style.left = `${left}px`;
    wanderer.element.style.top = `${top}px`;
  }
}

export function mountAnimalWanderers(workspace) {
  if (!workspace) {
    return;
  }

  layer = document.createElement("div");
  layer.className = "animal-wanderer-layer";
  workspace.appendChild(layer);
  onStateChange(render);
  render();

  if (!timer) {
    timer = window.setInterval(moveWanderers, WANDER_INTERVAL_MS);
  }
}
