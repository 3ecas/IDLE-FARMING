const seed = {
  id: "orangeSeed",
  category: "seeds",
  icon: "🍊",
  marketName: "Orange",
  inventoryName: "Orange seed",
  price: 38,
  cropProductId: "orangeCrop",
};

const crop = {
  id: "orangeCrop",
  category: "crops",
  icon: "🍊",
  marketName: "Orange",
  inventoryName: "Orange",
  price: 0,
  sellPrice: 20,
  growDurationMs: 610000,
  harvestYield: 4,
};

export const orange = {
  seed,
  crop,
  products: [seed, crop],
};
