const seed = {
  id: "spinachSeed",
  category: "seeds",
  icon: "🥬",
  marketName: "Spinach",
  inventoryName: "Spinach seed",
  price: 17,
  cropProductId: "spinachCrop",
};

const crop = {
  id: "spinachCrop",
  category: "crops",
  icon: "🥬",
  marketName: "Spinach",
  inventoryName: "Spinach",
  price: 0,
  sellPrice: 12,
  growDurationMs: 185000,
  harvestYield: 3,
};

export const spinach = {
  seed,
  crop,
  products: [seed, crop],
};
