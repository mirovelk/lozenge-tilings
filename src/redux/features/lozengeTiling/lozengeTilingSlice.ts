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
  canGenerate: boolean;
  canAddBox: boolean;
  canRemoveBox: boolean;
  walls: Vector3Tuple[];
  boxes: Vector3Tuple[];
}

const initialState: LozengeTilingState = {
  periods: {
    xShift: 1,
    yShift: 2,
    zHeight: 2,
  },
  iterations: 1,
  canGenerate: true,
  canAddBox: false,
  canRemoveBox: false,
  walls: [],
  boxes: [],
};

// using a separate class instance to keep track of tyling data
const lozengeTiling = new PeriodicLozengeTiling(initialState.periods);

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
      lozengeTiling.setPeriods(state.periods);
    },
    iterationsUpdated: (
      state,
      action: PayloadAction<{ interations: number }>
    ) => {
      state.iterations = action.payload.interations;
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
      const { iterations } = action.payload;

      lozengeTiling.reset();
      for (let i = 0; i < iterations; i++) {
        lozengeTiling.addRandomBox();
      }

      // // 2 random <0, 1)
      // const q = 0.9; // input <0, 1>

      // for (let i = 0; i < iterations; i++) {
      //   const num1 =
      //     (Math.log(1 - Math.random()) * -1) /
      //     lozengeTiling.addableBoxesCount() /
      //     q;
      //   const num2 =
      //     (Math.log(1 - Math.random()) * -1) /
      //     lozengeTiling.removableBoxesCount();

      //   if (num1 < num2) {
      //     lozengeTiling.addRandomBox();
      //   } else {
      //     lozengeTiling.removeRandomBox();
      //   }
      // }

      state.walls = lozengeTiling.getWallVoxels();
      state.boxes = lozengeTiling.getBoxVoxels();
      state.canAddBox = true;
      state.canRemoveBox = true;
    },
    addRandomBox: (state) => {
      lozengeTiling.addRandomBox();

      state.iterations += 1;
      state.walls = lozengeTiling.getWallVoxels();
      state.boxes = lozengeTiling.getBoxVoxels();
    },
    removeRandomBox: (state) => {
      if (state.iterations > 1) {
        lozengeTiling.removeRandomBox();

        state.iterations -= 1;
        state.walls = lozengeTiling.getWallVoxels();
        state.boxes = lozengeTiling.getBoxVoxels();
      } else {
        state.canRemoveBox = false;
      }
    },
  },
});

// Selectors
export const selectPeriods = (state: RootState) => {
  const { periods } = state.lozengeTiling;
  return periods;
};

export const selectIterations = (state: RootState) => {
  const { iterations } = state.lozengeTiling;
  return iterations;
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
  removeRandomBox,
} = actions;

export default reducer;
