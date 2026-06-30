const seed = {
  id: "eggplantSeed",
  category: "seeds",
  icon: "🍆",
  marketName: "Eggplant",
  inventoryName: "Eggplant seed",
  price: 62,
  cropProductId: "eggplantCrop",
};

const crop = {
  id: "eggplantCrop",
  category: "crops",
  icon: "🍆",
  marketName: "Eggplant",
  inventoryName: "Eggplant",
  price: 0,
  sellPrice: 33,
  growDurationMs: 980000,
  harvestYield: 4,
};

export const eggplant = {
  seed,
  crop,
  products: [seed, crop],
};
