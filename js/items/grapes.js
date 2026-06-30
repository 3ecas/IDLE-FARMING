const seed = {
  id: "grapesSeed",
  category: "seeds",
  icon: "🍇",
  marketName: "Grapes",
  inventoryName: "Grapes seed",
  price: 46,
  cropProductId: "grapesCrop",
};

const crop = {
  id: "grapesCrop",
  category: "crops",
  icon: "🍇",
  marketName: "Grapes",
  inventoryName: "Grapes",
  price: 0,
  sellPrice: 15,
  growDurationMs: 720000,
  harvestYield: 6,
};

export const grapes = {
  seed,
  crop,
  products: [seed, crop],
};
