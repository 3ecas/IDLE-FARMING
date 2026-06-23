import { flour } from "./items/flour.js";
import { nails } from "./items/nails.js";
import { wood } from "./items/wood.js";
import { CROPS, getCrop, getSeed, SEEDS } from "./seeds.js";

export const MATERIALS = {
  wood,
  nails,
};

export const PROCESSED_GOODS = {
  flour,
};

export const PRODUCTS = {
  ...SEEDS,
  ...CROPS,
  ...MATERIALS,
  ...PROCESSED_GOODS,
};

export const SHOP_SECTIONS = [
  {
    key: "seeds",
    label: "Seeds",
    productIds: ["wheatSeed", "cabbageSeed", "strawberrySeed"],
  },
  {
    key: "farmUpgrades",
    label: "Farm upgrades",
    productIds: [],
  },
  {
    key: "materials",
    label: "Materials",
    productIds: ["wood", "nails"],
  },
];

export const MARKET_SECTIONS = SHOP_SECTIONS;

export function getProduct(productId) {
  return getSeed(productId) || getCrop(productId) || MATERIALS[productId] || PROCESSED_GOODS[productId] || null;
}

export function getProductSellPrice(productId) {
  const product = getProduct(productId);
  return product?.sellPrice || 0;
}
