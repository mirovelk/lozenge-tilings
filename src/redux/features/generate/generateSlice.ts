import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vector3Tuple } from 'three';
import {
  generateRandomLozengeTiling,
  LozengeTiling,
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
        periods: {
          pX: number;
          pY: number;
          pZ: number;
        };
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
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      for (let z = 0; z < data[y][x]; z++) {
        // column height represented by number is rendered on y axis
        vexels.push([x, z, y]);
      }
    }
  }

  return vexels;
};

const { actions, reducer } = generateSlice;

export const { generate } = actions;

export default reducer;
