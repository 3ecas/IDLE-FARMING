import { mountPlot } from "./plot.js";
import { mountAnimalFeeder } from "./animalFeeder.js";
import { mountAnimalWanderers } from "./animalWanderers.js";
import { mountAnimalPen } from "./animalPen.js";
import { mountBakery } from "./bakery.js";
import { mountBeehive } from "./beehive.js";
import { mountChickenCoop } from "./chickenCoop.js";
import { mountMill } from "./mill.js";
import { mountFarmCursors } from "./cursor.js";
import { bootstrapGamePersistence } from "./persistence.js";
import { clearSelectedInventoryItem } from "./inventory.js";
import { mountInfoPanel } from "./infoPanel.js";
import { mountSidePanels } from "./sidePanels.js";
import { mountSceneCamera } from "./sceneCamera.js?v=3";
import { onStateChange, showCell, stabilizeLayoutPositions, state } from "./state.js";

const statusRoot = document.getElementById("status");
const workspace = document.getElementById("workspace");
const cellMount = document.getElementById("cell-mount");
const millMount = document.getElementById("mill-mount");
const bakeryMount = document.getElementById("bakery-mount");
const animalFeederMount = document.getElementById("animal-feeder-mount");
const animalPenMount = document.getElementById("animal-pen-mount");
const chickenCoopMount = document.getElementById("chicken-coop-mount");
const beehiveMount = document.getElementById("beehive-mount");

function renderStatus() {
  statusRoot.textContent = state.message;
}

bootstrapGamePersistence();
mountPlot(cellMount);
mountMill(millMount);
mountBakery(bakeryMount);
mountAnimalFeeder(animalFeederMount);
mountAnimalPen(animalPenMount);
mountChickenCoop(chickenCoopMount);
mountBeehive(beehiveMount);
mountAnimalWanderers(workspace);
mountInfoPanel();
mountSidePanels();
mountFarmCursors();
mountSceneCamera();
onStateChange(renderStatus);
renderStatus();
window.addEventListener("resize", () => {
  stabilizeLayoutPositions();
});

document.addEventListener("pointerdown", (event) => {
  const interactiveElement = event.target.closest(
    "[data-cell-key], [data-delete-zone], [data-restart-farm], [data-side-panel], [data-side-tabs], button, summary, input, textarea, select, a, label"
  );
  if (!interactiveElement) {
    clearSelectedInventoryItem();
  }
}, { capture: true });
