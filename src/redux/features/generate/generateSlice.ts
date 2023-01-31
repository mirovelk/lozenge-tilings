import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vector3Tuple } from 'three';
import {
  generateRandomLozengeTiling,
  LozengeTiling,
  LozengeTilingPeriods,
} from '../../../core/generate';

import { RootState } from '../../store';

interface GenerateState {
  data: LozengeTiling;
}

const initialState: GenerateState = {
  data: [],
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
      state.data = generateRandomLozengeTiling(action.payload);
    },
  },
});

// Selectors
export const selectVoxelPositions = (state: RootState) => {
  const { data } = state.generate;

  const vexels: Vector3Tuple[] = [];
  for (let x = 0; x < data.length; x++) {
    for (let y = 0; y < data[x].length; y++) {
      for (let z = 0; z < data[x][y]; z++) {
        vexels.push([x, y, z]);
      }
    }
  }

  return vexels;
};

const { actions, reducer } = generateSlice;

export const { generate } = actions;

export default reducer;
