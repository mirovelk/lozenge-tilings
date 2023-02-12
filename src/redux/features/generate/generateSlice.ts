import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vector3Tuple } from 'three';
import {
  generateRandomLozengeTiling,
  LozengeTilingPeriods,
} from '../../../core/lozengeTiling';

import { RootState } from '../../store';

interface GenerateState {
  walls: Vector3Tuple[];
  boxes: Vector3Tuple[];
}

const initialState: GenerateState = {
  walls: [],
  boxes: [],
};

export const generateSlice = createSlice({
  name: 'generate',
  initialState,
  reducers: {
    generate: (
      state,
      action: PayloadAction<{
        iterations: number;
        periods: LozengeTilingPeriods;
      }>
    ) => {
      const { walls, boxes } = generateRandomLozengeTiling(action.payload);
      state.walls = walls;
      state.boxes = boxes;
    },
  },
});

// Selectors
export const selectVoxelPositions = (state: RootState) => {
  const { walls, boxes } = state.generate;
  return { walls, boxes };
};

const { actions, reducer } = generateSlice;

export const { generate } = actions;

export default reducer;
