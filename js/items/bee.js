import { honey } from "./honey.js";

const animal = {
  id: "bee",
  category: "animals",
  icon: "🐝",
  marketName: "Bee",
  inventoryName: "Bee",
  price: 180,
  sellPrice: 6,
  outputProductId: honey.id,
  penBuildingId: "beehive",
};

export const bee = {
  animal,
  product: honey,
  products: [animal, honey],
};
