import { createSample5v5Command } from './sample-5v5';

export function createRushVsArcherCommand() {
  return {
    ...createSample5v5Command(),
    seed: 'rush-vs-archer'
  };
}
