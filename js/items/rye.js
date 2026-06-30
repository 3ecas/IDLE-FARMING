const seed = {
  id: "ryeSeed",
  category: "seeds",
  icon: "🌾",
  marketName: "Rye",
  inventoryName: "Rye seed",
  price: 48,
  cropProductId: "ryeCrop",
};

const crop = {
  id: "ryeCrop",
  category: "crops",
  icon: "🌾",
  marketName: "Rye",
  inventoryName: "Rye",
  price: 0,
  sellPrice: 15,
  growDurationMs: 760000,
  harvestYield: 6,
};

export const rye = {
  seed,
  crop,
  products: [seed, crop],
};
