const seed = {
  id: "carrotSeed",
  category: "seeds",
  icon: "🥕",
  marketName: "Carrot",
  inventoryName: "Carrot seed",
  price: 5,
  cropProductId: "carrotCrop",
};

const crop = {
  id: "carrotCrop",
  category: "crops",
  icon: "🥕",
  marketName: "Carrot",
  inventoryName: "Carrot",
  price: 0,
  sellPrice: 5,
  growDurationMs: 75000,
  harvestYield: 3,
};

export const carrot = {
  seed,
  crop,
  products: [seed, crop],
};
