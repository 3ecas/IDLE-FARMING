const seed = {
  id: "sunflowerSeed",
  category: "seeds",
  icon: "🌻",
  marketName: "Sunflower",
  inventoryName: "Sunflower seed",
  price: 52,
  cropProductId: "sunflowerCrop",
};

const crop = {
  id: "sunflowerCrop",
  category: "crops",
  icon: "🌻",
  marketName: "Sunflower",
  inventoryName: "Sunflower",
  price: 0,
  sellPrice: 14,
  growDurationMs: 810000,
  harvestYield: 7,
};

export const sunflower = {
  seed,
  crop,
  products: [seed, crop],
};
