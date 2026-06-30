const seed = {
  id: "cabbageSeed",
  category: "seeds",
  icon: "🥬",
  marketName: "Cabbage",
  inventoryName: "Cabbage seed",
  price: 3,
  cropProductId: "cabbageCrop",
};

const crop = {
  id: "cabbageCrop",
  category: "crops",
  icon: "🥬",
  marketName: "Cabbage",
  inventoryName: "Cabbage",
  price: 0,
  sellPrice: 3,
  growDurationMs: 40000,
  harvestYield: 3,
};

export const cabbage = {
  seed,
  crop,
  products: [seed, crop],
};
