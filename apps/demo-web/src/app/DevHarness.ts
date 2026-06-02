import {
  createDevHarnessPanel,
  type DevHarnessActions,
  type DevHarnessHandle
} from '../dev-ui/DevHarnessPanel';

export type { DevHarnessActions, DevHarnessHandle };

export function createDevHarness(
  host: HTMLElement,
  actions: DevHarnessActions
): DevHarnessHandle {
  const harness = createDevHarnessPanel(actions);
  host.appendChild(harness.root);
  return harness;
}
