const seed = {
  id: "broccoliSeed",
  category: "seeds",
  icon: "🥦",
  marketName: "Broccoli",
  inventoryName: "Broccoli seed",
  price: 36,
  cropProductId: "broccoliCrop",
};

const crop = {
  id: "broccoliCrop",
  category: "crops",
  icon: "🥦",
  marketName: "Broccoli",
  inventoryName: "Broccoli",
  price: 0,
  sellPrice: 27,
  growDurationMs: 560000,
  harvestYield: 3,
};

export const broccoli = {
  seed,
  crop,
  products: [seed, crop],
};
