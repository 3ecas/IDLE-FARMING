import { getCellGroupInfo, groupCells } from "./state.js";

export function tryJoinCellToNeighbor(draggedKey, dragSnapshot, finalPosition = null) {
  const draggedElement = dragSnapshot?.cell || dragSnapshot;
  const draggedRect = draggedElement.getBoundingClientRect();
  const draggedInfo = getCellGroupInfo(draggedKey);
  const draggedGroupId = draggedInfo?.group.id || null;
  const extraPositions = new Map();

  if (finalPosition && dragSnapshot?.members && typeof dragSnapshot.startLeft === "number" && typeof dragSnapshot.startTop === "number") {
    const deltaX = finalPosition.left - dragSnapshot.startLeft;
    const deltaY = finalPosition.top - dragSnapshot.startTop;

    for (const member of dragSnapshot.members) {
      extraPositions.set(member.key, {
        left: member.startLeft + deltaX,
        top: member.startTop + deltaY,
      });
    }
  }

  let bestCandidate = null;
  let bestOverlap = 0;

  for (const element of document.querySelectorAll("[data-cell-key]")) {
    const targetKey = element.dataset.cellKey;
    if (!targetKey || targetKey === draggedKey) {
      continue;
    }

    const targetInfo = getCellGroupInfo(targetKey);
    if (targetInfo && targetInfo.group.id === draggedGroupId) {
      continue;
    }

    const targetRect = element.getBoundingClientRect();
    const overlapWidth = Math.max(0, Math.min(draggedRect.right, targetRect.right) - Math.max(draggedRect.left, targetRect.left));
    const overlapHeight = Math.max(0, Math.min(draggedRect.bottom, targetRect.bottom) - Math.max(draggedRect.top, targetRect.top));
    const overlapArea = overlapWidth * overlapHeight;

    if (overlapArea <= 0 || overlapArea <= bestOverlap) {
      continue;
    }

    bestOverlap = overlapArea;
    bestCandidate = {
      key: targetKey,
      rect: targetRect,
    };
  }

  if (!bestCandidate) {
    return false;
  }

  const draggedCenterX = draggedRect.left + draggedRect.width / 2;
  const draggedCenterY = draggedRect.top + draggedRect.height / 2;
  const targetCenterX = bestCandidate.rect.left + bestCandidate.rect.width / 2;
  const targetCenterY = bestCandidate.rect.top + bestCandidate.rect.height / 2;
  const orientation = Math.abs(draggedCenterX - targetCenterX) > Math.abs(draggedCenterY - targetCenterY)
    ? "horizontal"
    : "vertical";

  return groupCells(draggedKey, bestCandidate.key, orientation, finalPosition, extraPositions);
}
