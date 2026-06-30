const seed = {
  id: "lemonSeed",
  category: "seeds",
  icon: "🍋",
  marketName: "Lemon",
  inventoryName: "Lemon seed",
  price: 28,
  cropProductId: "lemonCrop",
};

const crop = {
  id: "lemonCrop",
  category: "crops",
  icon: "🍋",
  marketName: "Lemon",
  inventoryName: "Lemon",
  price: 0,
  sellPrice: 22,
  growDurationMs: 510000,
  harvestYield: 3,
};

export const lemon = {
  seed,
  crop,
  products: [seed, crop],
};
