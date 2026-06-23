export const CELL_SIZES = {
  farm: { width: 72, height: 72 },
  market: { width: 160, height: 136 },
  shopping: { width: 176, height: 144 },
  barn: { width: 176, height: 144 },
  money: { width: 128, height: 72 },
  tools: { width: 120, height: 72 },
};

export function getCellSize(key) {
  return CELL_SIZES[key] || { width: 160, height: 120 };
}
