const crop = {
  id: "appleCrop",
  category: "crops",
  icon: "🍎",
  marketName: "Apple",
  inventoryName: "Apple",
  price: 0,
  sellPrice: 13,
  growDurationMs: 390000,
  harvestYield: 4,
  autoGrow: true,
  repeatHarvest: true,
};

export const apple = {
  crop,
  products: [crop],
};
