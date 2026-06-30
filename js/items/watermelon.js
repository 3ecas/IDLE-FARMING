const seed = {
  id: "watermelonSeed",
  category: "seeds",
  icon: "🍉",
  marketName: "Watermelon",
  inventoryName: "Watermelon seed",
  price: 58,
  cropProductId: "watermelonCrop",
};

const crop = {
  id: "watermelonCrop",
  category: "crops",
  icon: "🍉",
  marketName: "Watermelon",
  inventoryName: "Watermelon",
  price: 0,
  sellPrice: 62,
  growDurationMs: 920000,
  harvestYield: 2,
};

export const watermelon = {
  seed,
  crop,
  products: [seed, crop],
};
