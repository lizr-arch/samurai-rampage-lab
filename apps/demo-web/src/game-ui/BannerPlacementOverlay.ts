import { type BannerPlacementPreview, type PlacedBanner } from './banner-types';

interface BannerPlacementOverlayHandle {
  root: HTMLElement;
  setPreview(preview: BannerPlacementPreview | null): void;
  setPlacedBanners(banners: PlacedBanner[]): void;
}

function toPercentX(x: number): string {
  return `${(x / 1920) * 100}%`;
}

function toPercentY(y: number): string {
  return `${(y / 1080) * 100}%`;
}

function intentClass(intent: BannerPlacementPreview['intent'] | 'charge' | 'gather'): string {
  return intent === 'charge' ? 'charge' : 'gather';
}

function createPreviewNode(preview: BannerPlacementPreview): HTMLElement {
  const node = document.createElement('div');
  node.className = `banner-preview banner-preview--${intentClass(preview.intent)}`;
  node.style.left = toPercentX(preview.x);
  node.style.top = toPercentY(preview.y);
  node.style.width = `${preview.radiusPx * 2}px`;
  node.style.height = `${preview.radiusPx * 2}px`;

  const center = document.createElement('div');
  center.className = 'banner-preview__center';
  center.textContent = preview.label;
  const meta = document.createElement('div');
  meta.className = 'banner-preview__meta';
  meta.textContent = `影响 ${preview.affectedUnitCount} 队`;
  node.append(center, meta);
  return node;
}

function createPlacedBannerNode(banner: PlacedBanner): HTMLElement {
  const node = document.createElement('div');
  node.className = 'placed-banner';
  node.style.left = toPercentX(banner.x);
  node.style.top = toPercentY(banner.y);

  const flag = document.createElement('div');
  flag.className = `placed-banner__flag placed-banner__flag--${intentClass(banner.label === '冲' ? 'charge' : 'gather')}`;
  flag.textContent = banner.label;

  const aura = document.createElement('div');
  aura.className = `placed-banner__aura placed-banner__aura--${intentClass(banner.label === '冲' ? 'charge' : 'gather')}`;
  aura.style.width = `${banner.radiusPx * 2}px`;
  aura.style.height = `${banner.radiusPx * 2}px`;

  node.append(aura, flag);
  return node;
}

export function createBannerPlacementOverlay(): BannerPlacementOverlayHandle {
  const root = document.createElement('div');
  root.className = 'banner-placement-overlay';
  const previewLayer = document.createElement('div');
  previewLayer.className = 'banner-placement-overlay__preview';
  const placedLayer = document.createElement('div');
  placedLayer.className = 'banner-placement-overlay__placed';
  root.append(previewLayer, placedLayer);

  return {
    root,
    setPreview: (preview) => {
      previewLayer.replaceChildren();
      if (!preview) return;
      previewLayer.appendChild(createPreviewNode(preview));
    },
    setPlacedBanners: (banners) => {
      placedLayer.replaceChildren(...banners.map(createPlacedBannerNode));
    }
  };
}
