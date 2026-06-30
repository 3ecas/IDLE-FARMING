const seed = {
  id: "blueberrySeed",
  category: "seeds",
  icon: "🫐",
  marketName: "Blueberry",
  inventoryName: "Blueberry seed",
  price: 13,
  cropProductId: "blueberryCrop",
};

const crop = {
  id: "blueberryCrop",
  category: "crops",
  icon: "🫐",
  marketName: "Blueberry",
  inventoryName: "Blueberry",
  price: 0,
  sellPrice: 15,
  growDurationMs: 240000,
  harvestYield: 2,
};

export const blueberry = {
  seed,
  crop,
  products: [seed, crop],
};
