import { runBattle } from '@samurai-rampage/battle-core';
import { formatBattleEvent, summarizeBattle } from '@samurai-rampage/devtools';
import { createSample5v5Command } from '@samurai-rampage/scenarios';
import { createDebugPanel } from '../ui/create-debug-panel';
import { createPixiStage } from '../pixi/create-pixi-stage';
import { renderBattleReport } from '../pixi/replay-renderer';

const battleBackdropUrl = new URL('../../../../docs/references/pixel-battle-ui-reference.png', import.meta.url).href;

export async function createDemoApp(root: HTMLElement): Promise<void> {
  root.style.setProperty('--battle-backdrop-image', `url("${battleBackdropUrl}")`);
  root.innerHTML = '<div class="shell"><div class="stage-host"></div><div class="panel"></div></div>';

  const stageHost = root.querySelector<HTMLElement>('.stage-host');
  const panelHost = root.querySelector<HTMLElement>('.panel');
  if (!stageHost || !panelHost) throw new Error('Failed to create app shell');

  const app = await createPixiStage(stageHost);
  let cancelReplay: (() => void) | null = null;

  const run = () => {
    cancelReplay?.();
    const report = runBattle(createSample5v5Command());
    cancelReplay = renderBattleReport(app, report, { speed: 3 });

    panel.update({
      summary: summarizeBattle(report),
      events: report.events.slice(0, 80).map(formatBattleEvent).join('\n')
    });
  };

  const panel = createDebugPanel(panelHost, { onRun: run });
  run();
}
