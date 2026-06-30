const seed = {
  id: "strawberrySeed",
  category: "seeds",
  icon: "🍓",
  marketName: "Strawberry",
  inventoryName: "Strawberry seed",
  price: 4,
  cropProductId: "strawberryCrop",
};

const crop = {
  id: "strawberryCrop",
  category: "crops",
  icon: "🍓",
  marketName: "Strawberry",
  inventoryName: "Strawberry",
  price: 0,
  sellPrice: 5,
  growDurationMs: 55000,
  harvestYield: 2,
};

export const strawberry = {
  seed,
  crop,
  products: [seed, crop],
};
