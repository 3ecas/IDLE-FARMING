import { sheepMilk } from "./sheepMilk.js";
import { wool } from "./wool.js";

const animal = {
  id: "sheep",
  category: "animals",
  icon: "🐑",
  marketName: "Sheep",
  inventoryName: "Sheep",
  price: 750,
  sellPrice: 12,
  outputProductId: wool.id,
  penBuildingId: "animalPen",
};

export const sheep = {
  animal,
  product: wool,
  products: [animal, wool, sheepMilk],
};
