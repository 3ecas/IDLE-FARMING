import { appleTree } from "./items/appleTree.js";
import { banana } from "./items/banana.js";
import { barley } from "./items/barley.js";
import { bellPepper } from "./items/bellPepper.js";
import { blueberry } from "./items/blueberry.js";
import { broccoli } from "./items/broccoli.js";
import { cabbage } from "./items/cabbage.js";
import { carrot } from "./items/carrot.js";
import { corn } from "./items/corn.js";
import { eggplant } from "./items/eggplant.js";
import { grapes } from "./items/grapes.js";
import { lemon } from "./items/lemon.js";
import { lettuce } from "./items/lettuce.js";
import { mango } from "./items/mango.js";
import { oats } from "./items/oats.js";
import { onion } from "./items/onion.js";
import { orange } from "./items/orange.js";
import { pineapple } from "./items/pineapple.js";
import { potato } from "./items/potato.js";
import { pumpkin } from "./items/pumpkin.js";
import { quinoa } from "./items/quinoa.js";
import { rice } from "./items/rice.js";
import { rye } from "./items/rye.js";
import { soybeans } from "./items/soybeans.js";
import { spinach } from "./items/spinach.js";
import { strawberry } from "./items/strawberry.js";
import { straw } from "./items/straw.js";
import { sugarcane } from "./items/sugarcane.js";
import { sunflower } from "./items/sunflower.js";
import { tomato } from "./items/tomato.js";
import { watermelon } from "./items/watermelon.js";
import { wheat } from "./items/wheat.js";

export const CROP_ITEMS = [
  wheat,
  cabbage,
  strawberry,
  carrot,
  corn,
  onion,
  potato,
  blueberry,
  rice,
  sugarcane,
  spinach,
  appleTree,
  oats,
  tomato,
  lemon,
  bellPepper,
  barley,
  orange,
  soybeans,
  broccoli,
  grapes,
  pumpkin,
  rye,
  watermelon,
  sunflower,
  eggplant,
  pineapple,
  quinoa,
  banana,
  mango,
];
const CROP_PRODUCT_ITEMS = [...CROP_ITEMS, straw, lettuce];

export const SEEDS = Object.fromEntries(CROP_ITEMS.map(({ seed }) => [seed.id, seed]));

export const CROPS = Object.fromEntries(CROP_PRODUCT_ITEMS.map(({ crop }) => [crop.id, crop]));

export function getSeed(seedId) {
  return SEEDS[seedId] || null;
}

export function getCrop(cropId) {
  return CROPS[cropId] || null;
}
