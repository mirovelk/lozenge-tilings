import { createSlice, freeze, PayloadAction } from '@reduxjs/toolkit';
import { Vector3Tuple } from 'three';
import initWasm, * as wasm from '../../../../build/lib';

import {
  LozengeTilingPeriods,
  DrawDistance,
} from '../../../core/lozengeTiling';
import { withDurationLogging } from '../../../util/benchmark';

import { RootState } from '../../store';

interface LozengeTilingState {
  periods: LozengeTilingPeriods;
  iterations: number;
  q: number;
  drawDistance: DrawDistance;
  canGenerate: boolean;
  boxCounts: number[];
  walls: Vector3Tuple[];
  boxes: Vector3Tuple[];
}

await initWasm();

const initialDrawDistance: DrawDistance = {
  x: 10,
  y: 10,
  z: 10,
};

const initialPeriods = {
  xShift: 1,
  yShift: 2,
  zHeight: 2,
};

const lozengeTiling = new wasm.PeriodicLozengeTiling(
  initialPeriods.xShift,
  initialPeriods.yShift,
  initialPeriods.zHeight,
  initialDrawDistance.x,
  initialDrawDistance.y,
  initialDrawDistance.z
);

const initialState: LozengeTilingState = {
  periods: initialPeriods,
  iterations: 10,
  q: 0.9, // input <0, 1>
  drawDistance: initialDrawDistance,
  canGenerate: true,
  boxCounts: [],
  walls: freeze(lozengeTiling.getWallVoxels()),
  boxes: [],
};

export const lozengeTilingSlice = createSlice({
  name: 'lozengeTiling',
  initialState,
  reducers: {
    reset: (state) => {
      lozengeTiling.reset();
      state.walls = freeze(lozengeTiling.getWallVoxels());
      state.boxes = freeze(lozengeTiling.getBoxVoxels());
      state.boxCounts = [];
    },
    periodUpdated: (
      state,
      action: PayloadAction<Partial<LozengeTilingPeriods>>
    ) => {
      state.periods = { ...state.periods, ...action.payload };
      lozengeTiling.setPeriods(
        state.periods.xShift,
        state.periods.yShift,
        state.periods.zHeight
      );
      state.walls = freeze(lozengeTiling.getWallVoxels());
      state.boxes = [];
      state.boxCounts = [];
    },
    drawDistanceUpdated: (
      state,
      action: PayloadAction<Partial<DrawDistance>>
    ) => {
      const drawDistance = action.payload;
      state.drawDistance = { ...state.drawDistance, ...drawDistance };
      lozengeTiling.setDrawDistance(
        state.drawDistance.x,
        state.drawDistance.y,
        state.drawDistance.z
      );
      state.walls = freeze(lozengeTiling.getWallVoxels());
      state.boxes =
        state.boxes.length > 0 ? freeze(lozengeTiling.getBoxVoxels()) : [];
    },
    qUpdated: (state, action: PayloadAction<{ q: number }>) => {
      state.q = action.payload.q;
    },
    iterationsUpdated: (
      state,
      action: PayloadAction<{ interations: number }>
    ) => {
      state.iterations = action.payload.interations;
    },
    configValidated: (state, action: PayloadAction<{ valid: boolean }>) => {
      state.canGenerate = action.payload.valid;
    },
    generateByAddingOnly: (state) => {
      withDurationLogging('generateByAddingOnly', () => {
        lozengeTiling.generateByAddingOnly(state.iterations);
      });
      state.boxCounts.push(lozengeTiling.getPeriodBoxCount());
      state.boxes = freeze(lozengeTiling.getBoxVoxels());
    },
    generateWithMarkovChain: (state) => {
      withDurationLogging('generateByAddingOnly', () => {
        lozengeTiling.generateWithMarkovChain(state.iterations, state.q);
      });
      state.boxCounts.push(lozengeTiling.getPeriodBoxCount());
      state.boxes = freeze(lozengeTiling.getBoxVoxels());
    },
    addRandomBox: (state) => {
      lozengeTiling.addRandomBox();
      state.boxCounts.push(lozengeTiling.getPeriodBoxCount());
      state.boxes = freeze(lozengeTiling.getBoxVoxels());
    },
    removeRandomBox: (state) => {
      if (lozengeTiling.getPeriodBoxCount() > 1) {
        lozengeTiling.removeRandomBox();
        state.boxCounts.push(lozengeTiling.getPeriodBoxCount());
        state.boxes = freeze(lozengeTiling.getBoxVoxels());
      }
    },
  },
});

// Selectors
export const selectPeriods = (state: RootState) => {
  const { periods } = state.lozengeTiling;
  return periods;
};

export const selectQ = (state: RootState) => {
  const { q } = state.lozengeTiling;
  return q;
};

export const selectDrawDistance = (state: RootState) => {
  const { drawDistance } = state.lozengeTiling;
  return drawDistance;
};

export const selectIterations = (state: RootState) => {
  const { iterations } = state.lozengeTiling;
  return iterations;
};

export const selectCanGenerate = (state: RootState) => {
  const { canGenerate } = state.lozengeTiling;
  return canGenerate;
};

export const selectCanRemoveBox = (state: RootState) => {
  const { boxCounts } = state.lozengeTiling;
  return boxCounts.length > 0;
};

export const selectVoxelPositions = (state: RootState) => {
  const { walls, boxes } = state.lozengeTiling;
  return { walls, boxes };
};

export const selectPeriodBoxCount = (state: RootState) => {
  const { boxCounts } = state.lozengeTiling;
  return boxCounts.length > 0 ? boxCounts[boxCounts.length - 1] : 0;
};

export const selectBoxCountsAverage = (state: RootState) => {
  const { boxCounts } = state.lozengeTiling;
  if (boxCounts.length === 0) {
    return 0;
  }
  const sum = boxCounts.reduce((a, b) => a + b, 0);
  return sum / boxCounts.length;
};

const { actions, reducer } = lozengeTilingSlice;

export const {
  reset,
  generateByAddingOnly,
  generateWithMarkovChain,
  periodUpdated,
  iterationsUpdated,
  configValidated,
  addRandomBox,
  removeRandomBox,
  qUpdated,
  drawDistanceUpdated,
} = actions;

export default reducer;
