import { getProduct } from "./catalog.js";
import {
  clearInventorySelection,
  getBarnItemQuantity,
  isInventoryItemSelected,
  selectInventoryItem,
  state,
} from "./state.js";

export function getInventoryEntries() {
  return Object.entries(state.barn.items)
    .map(([productId, quantity]) => {
      const product = getProduct(productId);
      return product && quantity > 0 ? { product, quantity } : null;
    })
    .filter(Boolean);
}

export function handleInventorySelection(productId) {
  const product = getProduct(productId);
  if (!product) {
    return false;
  }

  if (getBarnItemQuantity(productId) <= 0) {
    return false;
  }

  if (product.category !== "seeds") {
    return false;
  }

  return selectInventoryItem(productId);
}

export function clearSelectedInventoryItem() {
  return clearInventorySelection();
}

export function isSelectedInventoryItem(productId) {
  return isInventoryItemSelected(productId);
}
