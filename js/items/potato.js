const seed = {
  id: "potatoSeed",
  category: "seeds",
  icon: "🥔",
  marketName: "Potato",
  inventoryName: "Potato seed",
  price: 9,
  cropProductId: "potatoCrop",
};

const crop = {
  id: "potatoCrop",
  category: "crops",
  icon: "🥔",
  marketName: "Potato",
  inventoryName: "Potato",
  price: 0,
  sellPrice: 4,
  growDurationMs: 150000,
  harvestYield: 5,
};

export const potato = {
  seed,
  crop,
  products: [seed, crop],
};
