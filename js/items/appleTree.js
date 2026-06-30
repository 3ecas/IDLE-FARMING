import { apple } from "./apple.js";

const seed = {
  id: "appleTreeSeed",
  category: "seeds",
  icon: "🌳",
  marketName: "Apple tree",
  inventoryName: "Apple tree",
  price: 24,
  cropProductId: apple.crop.id,
  placeOnPurchase: true,
  plantSize: {
    columns: 2,
    rows: 2,
  },
};

export const appleTree = {
  seed,
  crop: apple.crop,
  products: [seed, apple.crop],
};
