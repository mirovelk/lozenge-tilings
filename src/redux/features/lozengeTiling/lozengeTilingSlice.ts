import {
  createAsyncThunk,
  createSlice,
  freeze,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Vector3Tuple } from 'three';
import * as Comlink from 'comlink';

import {
  LozengeTilingPeriods,
  DrawDistance,
} from '../../../core/lozengeTiling';
import { RootState } from '../../store';
import { PeriodicLozengeTilingWorker } from '../../../core/lozengeTiling.worker';

interface LozengeTilingState {
  processing: boolean;
  periods: LozengeTilingPeriods;
  iterations: number;
  q: number;
  drawDistance: DrawDistance;
  canGenerate: boolean;
  boxCounts: number[];
  walls: Vector3Tuple[];
  boxes: Vector3Tuple[];
}

const lozengeTilingWorker = new Worker(
  new URL('../../../core/lozengeTiling.worker', import.meta.url),
  {
    name: 'lozengeTiling',
    type: 'module',
  }
);

const LozengeTiling =
  Comlink.wrap<typeof PeriodicLozengeTilingWorker>(lozengeTilingWorker);

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

const lozengeTiling = await new LozengeTiling(
  initialPeriods,
  initialDrawDistance
);

await lozengeTiling.init();

const initialWalls = await lozengeTiling.getWallVoxels();

const initialState: LozengeTilingState = {
  processing: false,
  periods: initialPeriods,
  iterations: 10,
  q: 0.9, // input <0, 1>
  drawDistance: initialDrawDistance,
  canGenerate: true,
  boxCounts: [],
  walls: freeze(initialWalls),
  boxes: [],
};

export const reset = createAsyncThunk('lozengeTiling/reset', async () => {
  await lozengeTiling.reset();
  return {
    walls: await lozengeTiling.getWallVoxels(),
    boxes: await lozengeTiling.getBoxVoxels(),
  };
});

export const periodUpdated = createAsyncThunk(
  'lozengeTiling/periodUpdated',
  async (periods: Partial<LozengeTilingPeriods>, { getState }) => {
    const previousPeriods = (getState() as RootState).lozengeTiling.periods;
    const nextPeriods = { ...previousPeriods, ...periods };
    await lozengeTiling.setPeriods(
      nextPeriods.xShift,
      nextPeriods.yShift,
      nextPeriods.zHeight
    );
    return {
      periods,
      walls: await lozengeTiling.getWallVoxels(),
    };
  }
);

export const drawDistanceUpdated = createAsyncThunk(
  'lozengeTiling/drawDistanceUpdated',
  async (drawDistance: Partial<DrawDistance>, { getState }) => {
    const state = getState() as RootState;
    const previousDrawDistance = state.lozengeTiling.drawDistance;
    const previousBoxes = state.lozengeTiling.boxes;

    const newDrawDistance = { ...previousDrawDistance, ...drawDistance };
    await lozengeTiling.setDrawDistance(
      newDrawDistance.x,
      newDrawDistance.y,
      newDrawDistance.z
    );
    return {
      drawDistance: newDrawDistance,
      walls: await lozengeTiling.getWallVoxels(),
      boxes: previousBoxes.length > 0 ? await lozengeTiling.getBoxVoxels() : [],
    };
  }
);

export const generateByAddingOnly = createAsyncThunk(
  'lozengeTiling/generateByAddingOnly',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const iterations = state.lozengeTiling.iterations;
    await lozengeTiling.generateByAddingOnly(iterations);
    return {
      periodBoxCount: await lozengeTiling.getPeriodBoxCount(),
      boxes: await lozengeTiling.getBoxVoxels(),
    };
  }
);

export const generateWithMarkovChain = createAsyncThunk(
  'lozengeTiling/generateWithMarkovChain',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const iterations = state.lozengeTiling.iterations;
    const q = state.lozengeTiling.q;
    await lozengeTiling.generateWithMarkovChain(iterations, q);
    return {
      periodBoxCount: await lozengeTiling.getPeriodBoxCount(),
      boxes: await lozengeTiling.getBoxVoxels(),
    };
  }
);

export const addRandomBox = createAsyncThunk(
  'lozengeTiling/addRandomBox',
  async () => {
    await lozengeTiling.addRandomBox();
    return {
      periodBoxCount: await lozengeTiling.getPeriodBoxCount(),
      boxes: await lozengeTiling.getBoxVoxels(),
    };
  }
);

export const removeRandomBox = createAsyncThunk(
  'lozengeTiling/removeRandomBox',
  async () => {
    await lozengeTiling.removeRandomBox();
    return {
      periodBoxCount: await lozengeTiling.getPeriodBoxCount(),
      boxes: await lozengeTiling.getBoxVoxels(),
    };
  }
);

export const lozengeTilingSlice = createSlice({
  name: 'lozengeTiling',
  initialState,
  reducers: {
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
  },
  extraReducers: (builder) => {
    // reset
    builder.addCase(reset.pending, (state) => {
      state.processing = true;
    });
    builder.addCase(reset.fulfilled, (state, action) => {
      state.walls = freeze(action.payload.walls);
      state.boxes = freeze(action.payload.boxes);
      state.boxCounts = [];
      state.processing = false;
    });
    builder.addCase(reset.rejected, (state, action) => {
      state.processing = false;
      console.error(action);
    });
    // periodUpdated
    builder.addCase(periodUpdated.pending, (state) => {
      state.processing = true;
    });
    builder.addCase(periodUpdated.fulfilled, (state, action) => {
      state.periods = { ...state.periods, ...action.payload.periods };
      state.walls = freeze(action.payload.walls);
      state.boxes = [];
      state.boxCounts = [];
      state.processing = false;
    });
    builder.addCase(periodUpdated.rejected, (state, action) => {
      state.processing = false;
      console.error(action);
    });
    // drawDistanceUpdated
    builder.addCase(drawDistanceUpdated.pending, (state) => {
      state.processing = true;
    });
    builder.addCase(drawDistanceUpdated.fulfilled, (state, action) => {
      state.drawDistance = action.payload.drawDistance;
      state.walls = freeze(action.payload.walls);
      state.boxes = freeze(action.payload.boxes);
      state.processing = false;
    });
    builder.addCase(drawDistanceUpdated.rejected, (state, action) => {
      state.processing = false;
      console.error(action);
    });
    // generateByAddingOnly
    builder.addCase(generateByAddingOnly.pending, (state) => {
      state.processing = true;
    });
    builder.addCase(generateByAddingOnly.fulfilled, (state, action) => {
      state.boxCounts.push(action.payload.periodBoxCount);
      state.boxes = freeze(action.payload.boxes);
      state.processing = false;
    });
    builder.addCase(generateByAddingOnly.rejected, (state, action) => {
      state.processing = false;
      console.error(action);
    });
    // generateWithMarkovChain
    builder.addCase(generateWithMarkovChain.pending, (state) => {
      state.processing = true;
    });
    builder.addCase(generateWithMarkovChain.fulfilled, (state, action) => {
      state.boxCounts.push(action.payload.periodBoxCount);
      state.boxes = freeze(action.payload.boxes);
      state.processing = false;
    });
    builder.addCase(generateWithMarkovChain.rejected, (state, action) => {
      state.processing = false;
      console.error(action);
    });
    // addRandomBox
    builder.addCase(addRandomBox.pending, (state) => {
      state.processing = true;
    });
    builder.addCase(addRandomBox.fulfilled, (state, action) => {
      state.boxCounts.push(action.payload.periodBoxCount);
      state.boxes = freeze(action.payload.boxes);
      state.processing = false;
    });
    builder.addCase(addRandomBox.rejected, (state, action) => {
      state.processing = false;
      console.error(action);
    });
    // removeRandomBox
    builder.addCase(removeRandomBox.pending, (state) => {
      state.processing = true;
    });
    builder.addCase(removeRandomBox.fulfilled, (state, action) => {
      state.boxCounts.push(action.payload.periodBoxCount);
      state.boxes = freeze(action.payload.boxes);
      state.processing = false;
    });
    builder.addCase(removeRandomBox.rejected, (state, action) => {
      state.processing = false;
      console.error(action);
    });
  },
});

// Selectors
export const selectProcessing = (state: RootState) => {
  const { processing } = state.lozengeTiling;
  return processing;
};

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
  return boxCounts.length > 0 && boxCounts[boxCounts.length - 1] > 0;
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

export const { iterationsUpdated, configValidated, qUpdated } = actions;

export default reducer;
