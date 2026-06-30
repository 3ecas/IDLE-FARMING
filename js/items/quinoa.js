const seed = {
  id: "quinoaSeed",
  category: "seeds",
  icon: "🌾",
  marketName: "Quinoa",
  inventoryName: "Quinoa seed",
  price: 70,
  cropProductId: "quinoaCrop",
};

const crop = {
  id: "quinoaCrop",
  category: "crops",
  icon: "🌾",
  marketName: "Quinoa",
  inventoryName: "Quinoa",
  price: 0,
  sellPrice: 24,
  growDurationMs: 1150000,
  harvestYield: 6,
};

export const quinoa = {
  seed,
  crop,
  products: [seed, crop],
};
