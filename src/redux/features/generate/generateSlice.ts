import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vector3Tuple } from 'three';
import {
  generateRandomLozengeTilingVoxels,
  LozengeTilingPeriods,
} from '../../../core/lozengeTiling';

import { RootState } from '../../store';

interface GenerateState {
  voxels: Vector3Tuple[];
}

const initialState: GenerateState = {
  voxels: [],
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
      state.voxels = generateRandomLozengeTilingVoxels(action.payload);
    },
  },
});

// Selectors
export const selectVoxelPositions = (state: RootState) => {
  const { voxels } = state.generate;
  return voxels;
};

const { actions, reducer } = generateSlice;

export const { generate } = actions;

export default reducer;
