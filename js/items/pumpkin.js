const seed = {
  id: "pumpkinSeed",
  category: "seeds",
  icon: "🎃",
  marketName: "Pumpkin",
  inventoryName: "Pumpkin seed",
  price: 50,
  cropProductId: "pumpkinCrop",
};

const crop = {
  id: "pumpkinCrop",
  category: "crops",
  icon: "🎃",
  marketName: "Pumpkin",
  inventoryName: "Pumpkin",
  price: 0,
  sellPrice: 53,
  growDurationMs: 840000,
  harvestYield: 2,
};

export const pumpkin = {
  seed,
  crop,
  products: [seed, crop],
};
