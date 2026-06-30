const seed = {
  id: "bellPepperSeed",
  category: "seeds",
  icon: "🫑",
  marketName: "Bell Pepper",
  inventoryName: "Bell Pepper seed",
  price: 30,
  cropProductId: "bellPepperCrop",
};

const crop = {
  id: "bellPepperCrop",
  category: "crops",
  icon: "🫑",
  marketName: "Bell Pepper",
  inventoryName: "Bell Pepper",
  price: 0,
  sellPrice: 16,
  growDurationMs: 430000,
  harvestYield: 4,
};

export const bellPepper = {
  seed,
  crop,
  products: [seed, crop],
};
