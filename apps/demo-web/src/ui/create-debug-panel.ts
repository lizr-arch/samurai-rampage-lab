type DebugPanelCallbacks = {
  onRun: () => void;
};

type DebugPanelState = {
  summary: string;
  events: string;
};

export function createDebugPanel(host: HTMLElement, callbacks: DebugPanelCallbacks) {
  host.innerHTML = `
    <h1>Samurai Rampage Lab</h1>
    <p>5v5 编阵自动战斗最小 Demo。</p>
    <button data-action="run">重新运行战斗</button>
    <h2>Summary</h2>
    <pre data-role="summary"></pre>
    <h2>Events</h2>
    <pre data-role="events"></pre>
  `;

  host.querySelector('[data-action="run"]')?.addEventListener('click', callbacks.onRun);

  return {
    update(state: DebugPanelState): void {
      const summary = host.querySelector<HTMLElement>('[data-role="summary"]');
      const events = host.querySelector<HTMLElement>('[data-role="events"]');
      if (summary) summary.textContent = state.summary;
      if (events) events.textContent = state.events;
    }
  };
}
