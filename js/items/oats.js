const seed = {
  id: "oatsSeed",
  category: "seeds",
  icon: "🌾",
  marketName: "Oats",
  inventoryName: "Oats seed",
  price: 22,
  cropProductId: "oatsCrop",
};

const crop = {
  id: "oatsCrop",
  category: "crops",
  icon: "🌾",
  marketName: "Oats",
  inventoryName: "Oats",
  price: 0,
  sellPrice: 6,
  growDurationMs: 360000,
  harvestYield: 7,
};

export const oats = {
  seed,
  crop,
  products: [seed, crop],
};
