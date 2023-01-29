import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../store';

interface ConfigState {
  pX: number;
  pY: number;
  pZ: number;
  interations: number;
  valid: boolean;
}

const initialState: ConfigState = {
  pX: 10,
  pY: 0,
  pZ: 10,
  interations: 1_000,
  valid: true,
};

export const generateSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    pXUpdated: (state, action: PayloadAction<{ period: number }>) => {
      state.pX = action.payload.period;
    },
    pYUpdated: (state, action: PayloadAction<{ period: number }>) => {
      state.pY = action.payload.period;
    },
    pZUpdated: (state, action: PayloadAction<{ period: number }>) => {
      state.pZ = action.payload.period;
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
  const { pX, pY, pZ } = state.config;
  return { pX, pY, pZ };
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

export const {
  pXUpdated,
  pYUpdated,
  pZUpdated,
  iterationsUpdated,
  configValidated,
} = actions;

export default reducer;
