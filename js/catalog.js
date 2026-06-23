import { CROPS, getCrop, getSeed, SEEDS } from "./seeds.js";

export const PRODUCTS = {
  ...SEEDS,
  ...CROPS,
};

export const MARKET_SECTIONS = [
  {
    key: "seeds",
    label: "Seeds",
    productIds: ["wheatSeed"],
  },
  {
    key: "farmUpgrades",
    label: "Farm upgrades",
    productIds: [],
  },
];

export function getProduct(productId) {
  return getSeed(productId) || getCrop(productId);
}
