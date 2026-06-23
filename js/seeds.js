import { cabbage } from "./items/cabbage.js";
import { wheat } from "./items/wheat.js";
import { strawberry } from "./items/strawberry.js";
import { straw } from "./items/straw.js";

export const SEEDS = {
  wheatSeed: wheat.seed,
  cabbageSeed: cabbage.seed,
  strawberrySeed: strawberry.seed,
  strawSeed: straw.seed,
};

export const CROPS = {
  wheatCrop: wheat.crop,
  cabbageCrop: cabbage.crop,
  strawberryCrop: strawberry.crop,
  strawCrop: straw.crop,
};

export function getSeed(seedId) {
  return SEEDS[seedId] || null;
}

export function getCrop(cropId) {
  return CROPS[cropId] || null;
}
