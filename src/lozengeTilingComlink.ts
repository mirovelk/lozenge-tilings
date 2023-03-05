import * as Comlink from 'comlink';
import { initialDrawDistance } from './components/DrawDistanceInputs';
import { initialPeriods } from './components/PeriodInputs';
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

const lozengeTilingComlink = await new LozengeTilingComlink(
  initialPeriods,
  initialDrawDistance
);

export { lozengeTilingComlink };
