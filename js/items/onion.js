const seed = {
  id: "onionSeed",
  category: "seeds",
  icon: "🧅",
  marketName: "Onion",
  inventoryName: "Onion seed",
  price: 7,
  cropProductId: "onionCrop",
};

const crop = {
  id: "onionCrop",
  category: "crops",
  icon: "🧅",
  marketName: "Onion",
  inventoryName: "Onion",
  price: 0,
  sellPrice: 6,
  growDurationMs: 105000,
  harvestYield: 3,
};

export const onion = {
  seed,
  crop,
  products: [seed, crop],
};
