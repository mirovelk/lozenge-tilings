import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LozengeTilingPeriods } from '../../../core/generate';

import { RootState } from '../../store';

interface ConfigState {
  periods: LozengeTilingPeriods;
  interations: number;
  valid: boolean;
}

const initialState: ConfigState = {
  periods: {
    xShift: 0,
    yShift: 0,
    zHeight: 0,
  },
  interations: 10,
  valid: true,
};

export const generateSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    periodUpdated: (
      state,
      action: PayloadAction<Partial<LozengeTilingPeriods>>
    ) => {
      state.periods = { ...state.periods, ...action.payload };
    },
    iterationsUpdated: (
      state,
      action: PayloadAction<{ interations: number }>
    ) => {
      state.interations = action.payload.interations;
    },
    configValidated: (state, action: PayloadAction<{ valid: boolean }>) => {
      state.valid = action.payload.valid;
    },
  },
});

// Selectors
export const selectPeriods = (state: RootState) => {
  const { periods } = state.config;
  return periods;
};

export const selectIterations = (state: RootState) => {
  const { interations } = state.config;
  return interations;
};

export const selectIsConfigValid = (state: RootState) => {
  const { valid } = state.config;
  return valid;
};

const { actions, reducer } = generateSlice;

export const { periodUpdated, iterationsUpdated, configValidated } = actions;

export default reducer;
