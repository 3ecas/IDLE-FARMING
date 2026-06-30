const seed = {
  id: "soybeansSeed",
  category: "seeds",
  icon: "🫘",
  marketName: "Soybeans",
  inventoryName: "Soybeans seed",
  price: 42,
  cropProductId: "soybeansCrop",
};

const crop = {
  id: "soybeansCrop",
  category: "crops",
  icon: "🫘",
  marketName: "Soybeans",
  inventoryName: "Soybeans",
  price: 0,
  sellPrice: 14,
  growDurationMs: 680000,
  harvestYield: 6,
};

export const soybeans = {
  seed,
  crop,
  products: [seed, crop],
};
