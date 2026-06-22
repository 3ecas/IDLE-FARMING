import { onStateChange, state } from "./state.js";

export function mountTools(container) {
  container.addEventListener("dragstart", (event) => {
    const tool = event.target.closest("[data-tool]");
    if (!tool) {
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ kind: "tool", tool: tool.dataset.tool })
    );
  });

  function render() {
    container.innerHTML = `
      <section class="widget-shell">
        <div class="widget-header drag-handle" data-widget-handle="tools">
          <div class="widget-title">
            <strong>Tools</strong>
            <span>Drag them onto crops</span>
          </div>
          <div class="grab-hint">⋮⋮</div>
        </div>
        <div class="widget-body">
          <div class="tools-icon">
            <div class="grab-hint">🛠️</div>
            <div class="market-small">Tool box</div>
          </div>
          <div class="tool-stack" style="margin-top:12px;">
            <div class="tool-item drag-item" draggable="true" data-tool="watering-can">
              <div class="tool-icon">💧</div>
              <div class="tool-copy">
                <strong>Watering can</strong>
                <span>Drop on a planted plot</span>
              </div>
            </div>
            <div class="tool-item drag-item" draggable="true" data-tool="harvest-tool">
              <div class="tool-icon">🧺</div>
              <div class="tool-copy">
                <strong>Harvest tool</strong>
                <span>Drop on mature wheat</span>
              </div>
            </div>
          </div>
          <div class="layout-tip">Tools stay in their box, but the box itself can move anywhere in the grid.</div>
        </div>
      </section>
    `;
  }

  onStateChange(render);
  render();
}
