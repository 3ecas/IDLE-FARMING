import { sheepMilk } from "./sheepMilk.js";

export const wool = {
  id: "wool",
  category: "processed",
  icon: "🧶",
  marketName: "Wool",
  inventoryName: "Wool",
  price: 0,
  sellPrice: 12,
  productionDurationMs: 240000,
  productionYieldMin: 1,
  productionYieldMax: 1,
  foodCost: {
    cornCrop: 1,
    strawCrop: 1,
  },
  productionDrops: {
    [sheepMilk.id]: 1,
  },
};
