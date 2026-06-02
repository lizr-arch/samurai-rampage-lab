import { DEFAULT_SCALE_LIMIT, FRAME_HEIGHT, FRAME_WIDTH, DEV_HARNESS_MIN_HEIGHT, MIN_FRAME_SCALE } from './layout-constants';

interface GameFrameScalerConfig {
  gameFrameElement: HTMLElement;
  shellElement: HTMLElement;
}

export function createGameFrameScaler(config: GameFrameScalerConfig): () => void {
  const apply = () => {
    const shellWidth = Math.max(config.shellElement.clientWidth, 1);
    const shellHeight = Math.max(window.innerHeight - DEV_HARNESS_MIN_HEIGHT, 1);
    const widthScale = shellWidth / FRAME_WIDTH;
    const heightScale = shellHeight / FRAME_HEIGHT;
    const desiredScale = Math.min(widthScale, heightScale, DEFAULT_SCALE_LIMIT);
    const safeScale = Math.max(desiredScale, MIN_FRAME_SCALE);

    config.gameFrameElement.style.setProperty('--frame-scale', safeScale.toFixed(4));
  };

  apply();
  const handleResize = (): void => apply();
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}
