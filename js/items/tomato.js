const seed = {
  id: "tomatoSeed",
  category: "seeds",
  icon: "🍅",
  marketName: "Tomato",
  inventoryName: "Tomato seed",
  price: 20,
  cropProductId: "tomatoCrop",
};

const crop = {
  id: "tomatoCrop",
  category: "crops",
  icon: "🍅",
  marketName: "Tomato",
  inventoryName: "Tomato",
  price: 0,
  sellPrice: 8,
  growDurationMs: 260000,
  harvestYield: 5,
};

export const tomato = {
  seed,
  crop,
  products: [seed, crop],
};
