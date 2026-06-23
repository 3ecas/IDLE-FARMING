import { flour } from "./items/flour.js";
import { cow } from "./items/cow.js";
import { milk } from "./items/milk.js";
import { nails } from "./items/nails.js";
import { wood } from "./items/wood.js";
import { CROPS, getCrop, getSeed, SEEDS } from "./seeds.js";

export const MATERIALS = {
  wood,
  nails,
};

export const ANIMALS = {
  cow: cow.animal,
};

export const PROCESSED_GOODS = {
  flour,
  milk,
};

export const PRODUCTS = {
  ...SEEDS,
  ...CROPS,
  ...ANIMALS,
  ...MATERIALS,
  ...PROCESSED_GOODS,
};

export const SHOP_SECTIONS = [
  {
    key: "seeds",
    label: "Seeds",
    productIds: ["wheatSeed", "cabbageSeed", "strawberrySeed", "strawSeed"],
  },
  {
    key: "animals",
    label: "Animals",
    productIds: ["cow"],
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
  return getSeed(productId) || getCrop(productId) || ANIMALS[productId] || MATERIALS[productId] || PROCESSED_GOODS[productId] || null;
}

export function getProductSellPrice(productId) {
  const product = getProduct(productId);
  return product?.sellPrice || 0;
}
