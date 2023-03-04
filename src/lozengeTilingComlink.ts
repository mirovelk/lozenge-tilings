import * as Comlink from 'comlink';
import { PeriodicLozengeTilingWorker } from './core/lozengeTiling.worker';

const lozengeTilingWorker = new Worker(
  new URL('./core/lozengeTiling.worker', import.meta.url),
  {
    name: 'lozengeTiling',
    type: 'module',
  }
);

const LozengeTilingComlink =
  Comlink.wrap<typeof PeriodicLozengeTilingWorker>(lozengeTilingWorker);

export { LozengeTilingComlink };
