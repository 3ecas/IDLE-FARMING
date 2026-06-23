import { deleteCellByKey, moveCell, moveFarmPlot, state } from "./state.js";

const GRID_SIZE = 24;
const DRAG_THRESHOLD = 4;
const OVERLAP_PADDING = 1;

let dragState = null;
const recentDraggedKeys = new Map();

function markRecentlyDragged(key) {
  recentDraggedKeys.set(key, Date.now());
  window.setTimeout(() => {
    const recorded = recentDraggedKeys.get(key);
    if (recorded && Date.now() - recorded >= 300) {
      recentDraggedKeys.delete(key);
    }
  }, 300);
}

export function wasRecentlyDragged(key) {
  const timestamp = recentDraggedKeys.get(key);
  if (!timestamp) {
    return false;
  }

  if (Date.now() - timestamp > 300) {
    recentDraggedKeys.delete(key);
    return false;
  }

  return true;
}

function clampToWorkspace(workspace, left, top, width, height) {
  const maxLeft = Math.max(0, workspace.clientWidth - width);
  const maxTop = Math.max(0, workspace.clientHeight - height);

  return {
    left: Math.min(maxLeft, Math.max(0, left)),
    top: Math.min(maxTop, Math.max(0, top)),
  };
}

function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function isFarmPlotKey(key) {
  return typeof key === "string" && key.startsWith("farm-plot-");
}

function getDeleteZoneRect() {
  const zone = document.querySelector("[data-delete-zone]");
  return zone ? zone.getBoundingClientRect() : null;
}

function setDeleteZoneActive(isActive) {
  const zone = document.querySelector("[data-delete-zone]");
  if (zone) {
    zone.classList.toggle("is-active", Boolean(isActive));
  }
}

function overlaps(left, top, width, height, rect, padding = 0) {
  return (
    left < rect.right + padding &&
    left + width + padding > rect.left &&
    top < rect.bottom + padding &&
    top + height + padding > rect.top
  );
}

function getViewportRect(workspace, left, top, width, height) {
  const workspaceRect = workspace.getBoundingClientRect();
  return {
    left: workspaceRect.left + left,
    top: workspaceRect.top + top,
    right: workspaceRect.left + left + width,
    bottom: workspaceRect.top + top + height,
  };
}

function isInsideDeleteZone(workspace, left, top, width, height) {
  const rect = getDeleteZoneRect();
  if (!rect) {
    return false;
  }

  const cellRect = getViewportRect(workspace, left, top, width, height);
  return overlaps(cellRect.left, cellRect.top, width, height, rect, 0);
}

function resolveNonOverlapPosition(key, workspace, left, top, width, height, deltaX, deltaY) {
  let candidateLeft = left;
  let candidateTop = top;
  const otherCells = Array.from(document.querySelectorAll("[data-cell-key]")).filter(
    (element) => element.dataset.cellKey !== key
  );

  for (let iteration = 0; iteration < 12; iteration += 1) {
    const collision = otherCells.find((element) => {
      return overlaps(candidateLeft, candidateTop, width, height, element.getBoundingClientRect(), OVERLAP_PADDING);
    });
    if (!collision) {
      return clampToWorkspace(workspace, candidateLeft, candidateTop, width, height);
    }

    const rect = collision.getBoundingClientRect();
    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      candidateLeft = deltaX >= 0 ? rect.left - width - OVERLAP_PADDING : rect.right + OVERLAP_PADDING;
    } else {
      candidateTop = deltaY >= 0 ? rect.top - height - OVERLAP_PADDING : rect.bottom + OVERLAP_PADDING;
    }

    const clamped = clampToWorkspace(workspace, candidateLeft, candidateTop, width, height);
    candidateLeft = clamped.left;
    candidateTop = clamped.top;
  }

  return clampToWorkspace(workspace, candidateLeft, candidateTop, width, height);
}

function endDrag() {
  if (!dragState) {
    return null;
  }

  const snapshot = dragState;
  snapshot.cell.classList.remove("is-dragging");
  document.body.classList.remove("is-dragging-cell");

  try {
    snapshot.cell.releasePointerCapture(snapshot.pointerId);
  } catch {
    // Best effort.
  }

  dragState = null;
  return snapshot;
}

export function mountMovableCell(container, { key, selector, onDrop }) {
  container.addEventListener("pointerdown", (event) => {
    const cell = event.target.closest(selector);
    if (!cell || event.button !== 0) {
      return;
    }

    const interactiveAncestor = event.target.closest("button, summary, input, textarea, select, a, label");
    if (interactiveAncestor && interactiveAncestor !== cell) {
      return;
    }

    dragState = {
      key: cell.dataset.cellKey || key,
      cell,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: cell.offsetLeft,
      startTop: cell.offsetTop,
      width: cell.offsetWidth,
      height: cell.offsetHeight,
      moved: false,
      workspace: container.closest(".workspace"),
    };

    cell.setPointerCapture(event.pointerId);
  });

  container.addEventListener("pointermove", (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) {
      return;
    }

    dragState.moved = true;
    dragState.cell.classList.add("is-dragging");
    document.body.classList.add("is-dragging-cell");
    const position = clampToWorkspace(
      dragState.workspace,
      dragState.startLeft + deltaX,
      dragState.startTop + deltaY,
      dragState.width,
      dragState.height
    );
    dragState.cell.style.left = `${position.left}px`;
    dragState.cell.style.top = `${position.top}px`;
    setDeleteZoneActive(isInsideDeleteZone(dragState.workspace, position.left, position.top, dragState.width, dragState.height));
    if (dragState.key === "market") {
      window.dispatchEvent(new Event("idle-farm-market-moved"));
    }
    event.preventDefault();
  });

  container.addEventListener("pointerup", (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }

    const snapshot = endDrag();
    if (!snapshot) {
      return;
    }

    if (!snapshot.moved) {
      return;
    }

    const finalPosition = clampToWorkspace(
      snapshot.workspace,
      snapToGrid(snapshot.cell.offsetLeft),
      snapToGrid(snapshot.cell.offsetTop),
      snapshot.width,
      snapshot.height
    );
    const isDeleted =
      snapshot.moved &&
      isInsideDeleteZone(snapshot.workspace, finalPosition.left, finalPosition.top, snapshot.width, snapshot.height);
    setDeleteZoneActive(false);

    if (isDeleted) {
      deleteCellByKey(snapshot.key);
      if (snapshot.key === "market") {
        window.dispatchEvent(new Event("idle-farm-market-moved"));
      }
      event.preventDefault();
      return;
    }

    const resolvedFinalPosition = resolveNonOverlapPosition(
      snapshot.key,
      snapshot.workspace,
      finalPosition.left,
      finalPosition.top,
      snapshot.width,
      snapshot.height,
      snapshot.cell.offsetLeft - snapshot.startLeft,
      snapshot.cell.offsetTop - snapshot.startTop
    );

    const settledPosition = snapshot.moved
      ? resolvedFinalPosition
      : { left: snapshot.startLeft, top: snapshot.startTop };

    if (snapshot.moved) {
      markRecentlyDragged(snapshot.key);
    }

    if (typeof onDrop === "function" && onDrop(snapshot, settledPosition) === true) {
      if (snapshot.key === "market") {
        window.dispatchEvent(new Event("idle-farm-market-moved"));
      }
      event.preventDefault();
      return;
    }

    if (snapshot.key in state.cells) {
      moveCell(snapshot.key, settledPosition.left, settledPosition.top);
    }
    if (snapshot.key === "market") {
      window.dispatchEvent(new Event("idle-farm-market-moved"));
    }

    event.preventDefault();
  });

  container.addEventListener("pointercancel", () => {
    if (!dragState) {
      return;
    }

    setDeleteZoneActive(false);
    const snapshot = endDrag();
    if (!snapshot) {
      return;
    }

    snapshot.cell.style.left = `${snapshot.startLeft}px`;
    snapshot.cell.style.top = `${snapshot.startTop}px`;
    if (snapshot.key in state.cells) {
      moveCell(snapshot.key, snapshot.startLeft, snapshot.startTop);
    } else if (isFarmPlotKey(snapshot.key)) {
      moveFarmPlot(snapshot.key, snapshot.startLeft, snapshot.startTop);
    }
    if (snapshot.key === "market") {
      window.dispatchEvent(new Event("idle-farm-market-moved"));
    }
  });
}
