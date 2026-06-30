const seed = {
  id: "bananaSeed",
  category: "seeds",
  icon: "🍌",
  marketName: "Banana",
  inventoryName: "Banana seed",
  price: 74,
  cropProductId: "bananaCrop",
};

const crop = {
  id: "bananaCrop",
  category: "crops",
  icon: "🍌",
  marketName: "Banana",
  inventoryName: "Banana",
  price: 0,
  sellPrice: 25,
  growDurationMs: 1080000,
  harvestYield: 6,
};

export const banana = {
  seed,
  crop,
  products: [seed, crop],
};
