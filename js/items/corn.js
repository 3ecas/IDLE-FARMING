const seed = {
  id: "cornSeed",
  category: "seeds",
  icon: "🌽",
  marketName: "Corn",
  inventoryName: "Corn seed",
  price: 8,
  cropProductId: "cornCrop",
};

const crop = {
  id: "cornCrop",
  category: "crops",
  icon: "🌽",
  marketName: "Corn",
  inventoryName: "Corn",
  price: 0,
  sellPrice: 3,
  growDurationMs: 135000,
  harvestYield: 6,
};

export const corn = {
  seed,
  crop,
  products: [seed, crop],
};
