import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vector3Tuple } from 'three';
import {
  PeriodicLozengeTiling,
  LozengeTilingPeriods,
} from '../../../core/lozengeTiling';

import { RootState } from '../../store';

interface LozengeTilingState {
  periods: LozengeTilingPeriods;
  iterations: number;
  q: number;
  drawDistance: number;
  infinityDrawDistance: number;
  canGenerate: boolean;
  walls: Vector3Tuple[];
  boxes: Vector3Tuple[];
}

const initialDrawDistance = 4;
const initialInfinityDrawDistance = 30;

const initialPeriods = {
  xShift: 1,
  yShift: 2,
  zHeight: 2,
};

// using a separate class instance to keep track of tyling data
const lozengeTiling = new PeriodicLozengeTiling(
  initialPeriods,
  initialDrawDistance,
  initialInfinityDrawDistance
);

const initialState: LozengeTilingState = {
  periods: initialPeriods,
  iterations: 10,
  q: 0.9, // input <0, 1>
  drawDistance: initialDrawDistance,
  infinityDrawDistance: initialInfinityDrawDistance,
  canGenerate: true,
  walls: lozengeTiling.getWallVoxels(),
  boxes: [],
};

export const lozengeTilingSlice = createSlice({
  name: 'lozengeTiling',
  initialState,
  reducers: {
    reset: (state) => {
      lozengeTiling.reset();
      state.walls = lozengeTiling.getWallVoxels();
      state.boxes = lozengeTiling.getBoxVoxels();
    },
    periodUpdated: (
      state,
      action: PayloadAction<Partial<LozengeTilingPeriods>>
    ) => {
      state.periods = { ...state.periods, ...action.payload };
      lozengeTiling.setPeriods(state.periods);
      state.walls = lozengeTiling.getWallVoxels();
      state.boxes = [];
    },
    drawDistanceUpdated: (
      state,
      action: PayloadAction<{ drawDistance: number }>
    ) => {
      const { drawDistance } = action.payload;
      lozengeTiling.setDrawDistance(drawDistance);
      state.drawDistance = drawDistance;
      state.walls = lozengeTiling.getWallVoxels();
      state.boxes = state.boxes.length > 0 ? lozengeTiling.getBoxVoxels() : [];
    },
    infinityDrawDistanceUpdated: (
      state,
      action: PayloadAction<{ infinityDrawDistance: number }>
    ) => {
      const { infinityDrawDistance } = action.payload;
      lozengeTiling.setInfinityDrawDistance(infinityDrawDistance);
      state.infinityDrawDistance = infinityDrawDistance;
      state.walls = lozengeTiling.getWallVoxels();
      state.boxes = state.boxes.length > 0 ? lozengeTiling.getBoxVoxels() : [];
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
      lozengeTiling.generateByAddingOnly(state.iterations);
      state.boxes = lozengeTiling.getBoxVoxels();
    },
    generateWithMarkovChain: (state) => {
      lozengeTiling.generateWithMarkovChain(state.iterations, state.q);
      state.boxes = lozengeTiling.getBoxVoxels();
    },
    addRandomBox: (state) => {
      lozengeTiling.addRandomBox();
      state.boxes = lozengeTiling.getBoxVoxels();
    },
    removeRandomBox: (state) => {
      if (state.boxes.length > 1) {
        lozengeTiling.removeRandomBox();
        state.boxes = lozengeTiling.getBoxVoxels();
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

export const selectInfinityDrawDistance = (state: RootState) => {
  const { infinityDrawDistance } = state.lozengeTiling;
  return infinityDrawDistance;
};

export const selectIterations = (state: RootState) => {
  const { iterations } = state.lozengeTiling;
  return iterations;
};

export const selectCanGenerate = (state: RootState) => {
  const { canGenerate } = state.lozengeTiling;
  return canGenerate;
};

export const selectCanRemoveBox = () => {
  return lozengeTiling.getPeriodBoxCount() > 0;
};

export const selectVoxelPositions = (state: RootState) => {
  const { walls, boxes } = state.lozengeTiling;
  return { walls, boxes };
};

export const selectPeriodBoxCount = () => {
  return lozengeTiling.getPeriodBoxCount();
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
  infinityDrawDistanceUpdated,
} = actions;

export default reducer;
