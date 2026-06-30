const seed = {
  id: "riceSeed",
  category: "seeds",
  icon: "🌾",
  marketName: "Rice",
  inventoryName: "Rice seed",
  price: 15,
  cropProductId: "riceCrop",
};

const crop = {
  id: "riceCrop",
  category: "crops",
  icon: "🍚",
  marketName: "Rice",
  inventoryName: "Rice",
  price: 0,
  sellPrice: 5,
  growDurationMs: 210000,
  harvestYield: 6,
};

export const rice = {
  seed,
  crop,
  products: [seed, crop],
};
