const seed = {
  id: "pineappleSeed",
  category: "seeds",
  icon: "🍍",
  marketName: "Pineapple",
  inventoryName: "Pineapple seed",
  price: 78,
  cropProductId: "pineappleCrop",
};

const crop = {
  id: "pineappleCrop",
  category: "crops",
  icon: "🍍",
  marketName: "Pineapple",
  inventoryName: "Pineapple",
  price: 0,
  sellPrice: 89,
  growDurationMs: 1320000,
  harvestYield: 2,
};

export const pineapple = {
  seed,
  crop,
  products: [seed, crop],
};
