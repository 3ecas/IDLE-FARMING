const seed = {
  id: "sugarcaneSeed",
  category: "seeds",
  icon: "🎋",
  marketName: "Sugarcane",
  inventoryName: "Sugarcane seed",
  price: 16,
  cropProductId: "sugarcaneCrop",
};

const crop = {
  id: "sugarcaneCrop",
  category: "crops",
  icon: "🎋",
  marketName: "Sugarcane",
  inventoryName: "Sugarcane",
  price: 0,
  sellPrice: 5,
  growDurationMs: 270000,
  harvestYield: 6,
};

export const sugarcane = {
  seed,
  crop,
  products: [seed, crop],
};
