import { Application, Container, Graphics, Text } from 'pixi.js';
import { playReplay } from '@samurai-rampage/replay';
import type { BattleReport, GridPos, UnitId } from '@samurai-rampage/contracts';

type RendererOptions = {
  speed: number;
};

type UnitVisual = {
  root: Container;
  body: Graphics;
  hpText: Text;
};

const cell = 82;
const origin = { x: 120, y: 90 };

export function renderBattleReport(
  app: Application,
  report: BattleReport,
  options: RendererOptions
): () => void {
  app.stage.removeChildren();
  drawGrid(app);

  const visuals = new Map<UnitId, UnitVisual>();
  for (const unit of report.initialState.units) {
    const visual = createUnitVisual(unit.side === 'player' ? 'player' : 'enemy', unit.hp);
    visual.root.position.set(toScreen(unit.pos).x, toScreen(unit.pos).y);
    app.stage.addChild(visual.root);
    visuals.set(unit.id, visual);
  }

  return playReplay(report.events, {
    speed: options.speed,
    onFrame(frame) {
      for (const event of frame.events) {
        if (event.type === 'move') {
          const visual = visuals.get(event.unitId);
          visual?.root.position.set(toScreen(event.to).x, toScreen(event.to).y);
        }

        if (event.type === 'damage') {
          const visual = visuals.get(event.unitId);
          if (visual) visual.hpText.text = String(event.hpAfter);
        }

        if (event.type === 'death') {
          const visual = visuals.get(event.unitId);
          if (visual) visual.root.alpha = 0.25;
        }
      }
    }
  });
}

function drawGrid(app: Application): void {
  const grid = new Graphics();
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 8; x++) {
      const p = toScreen({ x, y });
      grid.rect(p.x - cell / 2, p.y - cell / 2, cell - 6, cell - 6);
      grid.stroke({ width: 1, color: 0x3f3f46 });
    }
  }
  app.stage.addChild(grid);
}

function createUnitVisual(side: 'player' | 'enemy', hp: number): UnitVisual {
  const root = new Container();
  const body = new Graphics();
  const color = side === 'player' ? 0x60a5fa : 0xf87171;
  body.circle(0, 0, 26);
  body.fill(color);

  const hpText = new Text({ text: String(hp), style: { fill: '#ffffff', fontSize: 14 } });
  hpText.anchor.set(0.5);
  hpText.y = -4;

  root.addChild(body, hpText);
  return { root, body, hpText };
}

function toScreen(pos: GridPos): { x: number; y: number } {
  return {
    x: origin.x + pos.x * cell,
    y: origin.y + pos.y * cell
  };
}
