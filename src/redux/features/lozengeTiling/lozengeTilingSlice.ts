import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vector3Tuple } from 'three';
import {
  PeriodicLozengeTiling,
  LozengeTiling,
  LozengeTilingPeriods,
} from '../../../core/lozengeTiling';

import { RootState } from '../../store';

interface LozengeTilingState {
  periods: LozengeTilingPeriods;
  interations: number;
  canGenerate: boolean;
  canAddBox: boolean;
  canRemoveBox: boolean;
  tilingData: LozengeTiling;
  walls: Vector3Tuple[];
  boxes: Vector3Tuple[];
}

const initialState: LozengeTilingState = {
  periods: {
    xShift: 1,
    yShift: 2,
    zHeight: 2,
  },
  interations: 3,
  canGenerate: true,
  canAddBox: false,
  canRemoveBox: false,
  tilingData: {
    data: [],
    addableBoxes: [],
  },
  walls: [],
  boxes: [],
};

export const lozengeTilingSlice = createSlice({
  name: 'lozengeTiling',
  initialState,
  reducers: {
    periodUpdated: (
      state,
      action: PayloadAction<Partial<LozengeTilingPeriods>>
    ) => {
      state.periods = { ...state.periods, ...action.payload };
      state.canAddBox = false;
      state.canRemoveBox = false;
    },
    iterationsUpdated: (
      state,
      action: PayloadAction<{ interations: number }>
    ) => {
      state.interations = action.payload.interations;
      state.canAddBox = false;
      state.canRemoveBox = false;
    },
    configValidated: (state, action: PayloadAction<{ valid: boolean }>) => {
      state.canGenerate = action.payload.valid;
    },
    generate: (
      state,
      action: PayloadAction<{
        iterations: number;
        periods: LozengeTilingPeriods;
      }>
    ) => {
      const { iterations, periods } = action.payload;

      const lozengeTiling = new PeriodicLozengeTiling(periods);

      for (let i = 0; i < iterations; i++) {
        const nextBox = lozengeTiling.getRandomAddableBox();
        lozengeTiling.addBox(...nextBox);
      }

      state.tilingData = lozengeTiling.export();
      state.walls = lozengeTiling.getWallVoxels();
      state.boxes = lozengeTiling.getBoxVoxels();
      state.canAddBox = true;
      state.canRemoveBox = false;
    },
    addRandomBox: (state) => {
      const { tilingData, periods } = state;

      const lozengeTiling = new PeriodicLozengeTiling(periods);
      lozengeTiling.import(tilingData);

      const nextBox = lozengeTiling.getRandomAddableBox();
      lozengeTiling.addBox(...nextBox);

      state.interations += 1;
      state.walls = lozengeTiling.getWallVoxels();
      state.boxes = lozengeTiling.getBoxVoxels();
      state.tilingData = lozengeTiling.export();
    },
  },
});

// Selectors
export const selectPeriods = (state: RootState) => {
  const { periods } = state.lozengeTiling;
  return periods;
};

export const selectIterations = (state: RootState) => {
  const { interations } = state.lozengeTiling;
  return interations;
};

export const selectCanGenerate = (state: RootState) => {
  const { canGenerate } = state.lozengeTiling;
  return canGenerate;
};

export const selectCanAddBox = (state: RootState) => {
  const { canAddBox } = state.lozengeTiling;
  return canAddBox;
};

export const selectCanRemoveBox = (state: RootState) => {
  const { canRemoveBox } = state.lozengeTiling;
  return canRemoveBox;
};

export const selectVoxelPositions = (state: RootState) => {
  const { walls, boxes } = state.lozengeTiling;
  return { walls, boxes };
};

const { actions, reducer } = lozengeTilingSlice;

export const {
  generate,
  periodUpdated,
  iterationsUpdated,
  configValidated,
  addRandomBox,
} = actions;

export default reducer;
