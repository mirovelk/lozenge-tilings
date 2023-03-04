import { atom } from 'jotai';
import {
  DrawDistance,
  LozengeTilingPeriods,
} from './core/lozengeTiling.worker';
import { LozengeTilingComlink } from './lozengeTilingComlink';

// worker state init
const initialDrawDistance = {
  x: 10,
  y: 10,
  z: 10,
};

const initialPeriods = {
  xShift: 1,
  yShift: 2,
  zHeight: 2,
};

const lozengeTilingComlink = await new LozengeTilingComlink(
  initialPeriods,
  initialDrawDistance
);

await lozengeTilingComlink.init();
const initialWalls = await lozengeTilingComlink.getWallVoxels();

// jotai state
export const processingAtom = atom(false);
export const showProgressAtom = atom(false);

let showProgressTimeout: ReturnType<typeof setTimeout> | null = null;
const processingWithProgressAtom = atom(
  (get) => get(processingAtom) && get(showProgressAtom),
  (_, set, processing: boolean) => {
    if (showProgressTimeout) {
      clearTimeout(showProgressTimeout);
    }
    set(processingAtom, processing);
    if (processing) {
      showProgressTimeout = setTimeout(() => {
        set(showProgressAtom, true);
      }, 1000);
    } else {
      set(showProgressAtom, false);
    }
  }
);
const startProcessingAtom = atom(null, (_, set) => {
  set(processingWithProgressAtom, true);
});
const stopProcessingAtom = atom(null, (_, set) => {
  set(processingWithProgressAtom, false);
});

export const iterationsAtom = atom(10);
export const qAtom = atom(0.9);

export const periodsAtom = atom(
  initialPeriods,
  async (get, set, periodsUpdate: Partial<LozengeTilingPeriods>) => {
    const periods = get(periodsAtom);
    const newPeriods = { ...periods, ...periodsUpdate };
    set(periodsAtom, newPeriods);
    set(startProcessingAtom);
    await lozengeTilingComlink.setPeriods(newPeriods);
    set(boxesAtom, []);
    set(wallsAtom, await lozengeTilingComlink.getWallVoxels());
    set(stopProcessingAtom);
  }
);

export const drawDistanceAtom = atom(
  initialDrawDistance,
  async (get, set, drawDistanceUpdate: Partial<DrawDistance>) => {
    const drawDistance = get(drawDistanceAtom);
    const newDrawDistance = { ...drawDistance, ...drawDistanceUpdate };
    set(drawDistanceAtom, newDrawDistance);
    set(startProcessingAtom);
    await lozengeTilingComlink.setDrawDistance(newDrawDistance);
    set(wallsAtom, await lozengeTilingComlink.getWallVoxels());
    set(boxesAtom, await lozengeTilingComlink.getBoxVoxels());
    set(stopProcessingAtom);
  }
);

const boxCountsAtom = atom<number[]>([]);
export const totalBoxCountAtom = atom((get) => {
  const boxCounts = get(boxCountsAtom);
  return boxCounts.length > 0 ? boxCounts[boxCounts.length - 1] : 0;
});
export const boxCountsAverageAtom = atom((get) => {
  const boxCounts = get(boxCountsAtom);
  if (boxCounts.length === 0) {
    return 0;
  }
  const sum = boxCounts.reduce((a, b) => a + b, 0);
  return sum / boxCounts.length;
});
export const canRemoveBoxAtom = atom((get) => {
  const boxCounts = get(boxCountsAtom);
  return boxCounts.length > 0 && boxCounts[0] > 0;
});

export const wallsAtom = atom(initialWalls);

export const boxesAtom = atom([], async (_, set, boxes) => {
  set(boxesAtom, boxes);
  const boxCounts = await lozengeTilingComlink.getPeriodBoxCount();
  if (boxCounts === 0) {
    set(boxCountsAtom, []);
  } else {
    set(boxCountsAtom, (prevBoxCounts) => [...prevBoxCounts, boxCounts]);
  }
});

export const markovChainAtom = atom(true);

const generateWithMarkovChainAtom = atom(null, async (get, set) => {
  const iterations = get(iterationsAtom);
  const q = get(qAtom);
  set(startProcessingAtom);
  await lozengeTilingComlink.generateWithMarkovChain(iterations, q);
  set(boxesAtom, await lozengeTilingComlink.getBoxVoxels());
  set(stopProcessingAtom);
});

const generateByAddingOnlyAtom = atom(null, async (get, set) => {
  const iterations = get(iterationsAtom);
  set(startProcessingAtom);
  await lozengeTilingComlink.generateByAddingOnly(iterations);
  set(boxesAtom, await lozengeTilingComlink.getBoxVoxels());
  set(stopProcessingAtom);
});

export const generateTilingAtom = atom(null, async (get, set) => {
  const markovChain = get(markovChainAtom);
  if (markovChain) {
    set(generateWithMarkovChainAtom);
  } else {
    set(generateByAddingOnlyAtom);
  }
});

export const addBoxAtom = atom(null, async (_, set) => {
  set(startProcessingAtom);
  await lozengeTilingComlink.addRandomBox();
  set(boxesAtom, await lozengeTilingComlink.getBoxVoxels());
  set(stopProcessingAtom);
});

export const removeBoxAtom = atom(null, async (_, set) => {
  set(startProcessingAtom);
  await lozengeTilingComlink.removeRandomBox();
  set(boxesAtom, await lozengeTilingComlink.getBoxVoxels());
  set(stopProcessingAtom);
});

export const resetAtom = atom(null, async (get, set) => {
  set(startProcessingAtom);
  await lozengeTilingComlink.reset();
  set(boxesAtom, []);
  set(boxCountsAtom, []);
  set(wallsAtom, await lozengeTilingComlink.getWallVoxels());
  set(stopProcessingAtom);
});
