const seed = {
  id: "barleySeed",
  category: "seeds",
  icon: "🌾",
  marketName: "Barley",
  inventoryName: "Barley seed",
  price: 32,
  cropProductId: "barleyCrop",
};

const crop = {
  id: "barleyCrop",
  category: "crops",
  icon: "🌾",
  marketName: "Barley",
  inventoryName: "Barley",
  price: 0,
  sellPrice: 9,
  growDurationMs: 520000,
  harvestYield: 7,
};

export const barley = {
  seed,
  crop,
  products: [seed, crop],
};
