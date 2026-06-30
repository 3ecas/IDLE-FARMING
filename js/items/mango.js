const seed = {
  id: "mangoSeed",
  category: "seeds",
  icon: "🥭",
  marketName: "Mango",
  inventoryName: "Mango seed",
  price: 90,
  cropProductId: "mangoCrop",
};

const crop = {
  id: "mangoCrop",
  category: "crops",
  icon: "🥭",
  marketName: "Mango",
  inventoryName: "Mango",
  price: 0,
  sellPrice: 69,
  growDurationMs: 1460000,
  harvestYield: 3,
};

export const mango = {
  seed,
  crop,
  products: [seed, crop],
};
