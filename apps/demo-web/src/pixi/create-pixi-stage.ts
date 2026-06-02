import { Application } from 'pixi.js';

export async function createPixiStage(host: HTMLElement): Promise<Application> {
  const app = new Application();
  await app.init({
    width: 900,
    height: 520,
    background: '#16161a',
    antialias: true
  });

  host.appendChild(app.canvas);
  return app;
}
