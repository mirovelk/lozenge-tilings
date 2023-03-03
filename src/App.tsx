import {
  Button,
  Paper,
  css,
  styled,
  Checkbox,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import MainScene from './components/MainScene';
import ConfigNumberInputWithLabel from './components/ConfigNumberInputWithLabel';
import * as Comlink from 'comlink';

import StyleProvider from './components/StyleProvider';

import { Add, Remove } from '@mui/icons-material';
import { Vector3Tuple } from 'three';
import { PeriodicLozengeTilingWorker } from './core/lozengeTiling.worker';
import { useProcessingProgress } from './hooks/useProcessingProgress';

const Panel = styled(Paper)`
  padding: 10px;
`;

function isInputValueValidIterations(value: string) {
  return value !== '' && Number(value) >= 0 && Number.isInteger(Number(value));
}

function isInputValueValidPeriod(value: string) {
  return value !== '' && Number(value) >= 0 && Number.isInteger(Number(value));
}

function isInputValueValidQ(value: string) {
  return value !== '' && Number(value) >= 0 && Number(value) <= 1;
}

function isInputValueValidDrawDistance(value: string) {
  return value !== '' && Number(value) >= 1 && Number.isInteger(Number(value));
}

const initialDrawDistance = {
  x: 10,
  y: 10,
  z: 10,
};

const initialPeriods = {
  xShift: 1,
  yShift: 2,
  zHeight: 2,
};

const lozengeTilingWorker = new Worker(
  new URL('./core/lozengeTiling.worker', import.meta.url),
  {
    name: 'lozengeTiling',
    type: 'module',
  }
);

const LozengeTiling =
  Comlink.wrap<typeof PeriodicLozengeTilingWorker>(lozengeTilingWorker);

const lozengeTilingComlink = await new LozengeTiling(
  initialPeriods,
  initialDrawDistance
);

await lozengeTilingComlink.init();

const initialWalls = await lozengeTilingComlink.getWallVoxels();

interface LozengeTilingPeriods {
  xShift: number;
  yShift: number;
  zHeight: number;
}

interface DrawDistance {
  x: number;
  y: number;
  z: number;
}

function App() {
  const [configValid, setConfigValid] = useState(true);

  const { processing, showProgress, startProcessing, stopProcessing } =
    useProcessingProgress();

  const [periods, setPeriods] = useState<LozengeTilingPeriods>({
    xShift: 1,
    yShift: 2,
    zHeight: 2,
  });
  const [iterations, setIterations] = useState(10);
  const [q, setQ] = useState(0.9);
  const [drawDistance, setDrawDistance] = useState<DrawDistance>({
    x: 10,
    y: 10,
    z: 10,
  });
  const [boxCounts, setBoxCounts] = useState<number[]>([]);
  const canRemoveBox = useMemo(
    () => boxCounts.length > 0 && boxCounts[boxCounts.length - 1] > 0,
    [boxCounts]
  );

  const [walls, setWalls] = useState<Vector3Tuple[]>(initialWalls);
  const [boxes, setBoxes] = useState<Vector3Tuple[]>([]);

  const [markovChain, setMarkovChain] = useState(true);

  const onIterationsChange = useCallback((interations: number) => {
    setIterations(interations);
  }, []);

  const onPeriodsChange = useCallback(
    async (periods: LozengeTilingPeriods) => {
      setPeriods(periods);
      startProcessing();
      setBoxes([]);
      setBoxCounts([]);
      await lozengeTilingComlink.setPeriods(periods);
      setWalls(await lozengeTilingComlink.getWallVoxels());
      stopProcessing();
    },
    [startProcessing, stopProcessing]
  );

  const onQChange = useCallback((q: number) => {
    setQ(q);
  }, []);

  const onDrawDistanceChange = useCallback(
    async (drawDistance: DrawDistance) => {
      setDrawDistance(drawDistance);
      startProcessing();
      await lozengeTilingComlink.setDrawDistance(drawDistance);
      setWalls(await lozengeTilingComlink.getWallVoxels());
      setBoxes(await lozengeTilingComlink.getBoxVoxels());
      stopProcessing();
    },
    [startProcessing, stopProcessing]
  );

  const generateWithMarkovChain = useCallback(async () => {
    startProcessing();
    await lozengeTilingComlink.generateWithMarkovChain(iterations, q);
    setBoxes(await lozengeTilingComlink.getBoxVoxels());
    const boxCounts = await lozengeTilingComlink.getPeriodBoxCount();
    setBoxCounts((prevBoxCounts) => [...prevBoxCounts, boxCounts]);
    stopProcessing();
  }, [iterations, q, startProcessing, stopProcessing]);

  const generateByAddingOnly = useCallback(async () => {
    startProcessing();
    await lozengeTilingComlink.generateByAddingOnly(iterations);
    setBoxes(await lozengeTilingComlink.getBoxVoxels());
    const boxCounts = await lozengeTilingComlink.getPeriodBoxCount();
    setBoxCounts((prevBoxCounts) => [...prevBoxCounts, boxCounts]);
    stopProcessing();
  }, [iterations, startProcessing, stopProcessing]);

  const generateTiling = useCallback(async () => {
    if (markovChain) {
      await generateWithMarkovChain();
    } else {
      await generateByAddingOnly();
    }
  }, [markovChain, generateByAddingOnly, generateWithMarkovChain]);

  const onConfigSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (configValid && !processing) {
        await generateTiling();
      }
    },
    [configValid, generateTiling, processing]
  );

  const onAddBoxClick = useCallback(async () => {
    startProcessing();
    await lozengeTilingComlink.addRandomBox();
    setBoxes(await lozengeTilingComlink.getBoxVoxels());
    const boxCounts = await lozengeTilingComlink.getPeriodBoxCount();
    setBoxCounts((prevBoxCounts) => [...prevBoxCounts, boxCounts]);
    stopProcessing();
  }, [startProcessing, stopProcessing]);

  const onRemoveBoxClick = useCallback(async () => {
    if (canRemoveBox) {
      startProcessing();
      await lozengeTilingComlink.removeRandomBox();
      setBoxes(await lozengeTilingComlink.getBoxVoxels());
      const boxCounts = await lozengeTilingComlink.getPeriodBoxCount();
      setBoxCounts((prevBoxCounts) => [...prevBoxCounts, boxCounts]);
      stopProcessing();
    }
  }, [canRemoveBox, startProcessing, stopProcessing]);

  const resetOnClick = useCallback(async () => {
    startProcessing();
    await lozengeTilingComlink.reset();
    setBoxes([]);
    setBoxCounts([]);
    setWalls(await lozengeTilingComlink.getWallVoxels());
    stopProcessing();
  }, [startProcessing, stopProcessing]);

  return (
    <StyleProvider>
      <div
        css={css`
          height: 4px;
        `}
      >
        {showProgress && <LinearProgress />}
      </div>

      <div
        css={css`
          height: 100%;
          padding: 15px;
          display: flex;
          flex-direction: column;
        `}
      >
        <form onSubmit={onConfigSubmit}>
          <Panel
            css={css`
              margin-bottom: 20px;
              width: 100%;
            `}
          >
            <div
              css={css`
                margin-bottom: 20px;
                width: 100%;
                display: flex;
                justify-content: space-between;
              `}
            >
              <div
                css={css`
                  display: flex;
                  align-items: baseline;
                `}
              >
                <ConfigNumberInputWithLabel
                  label="Iterations:"
                  initialValue={iterations}
                  inputValueValid={isInputValueValidIterations}
                  onValidChange={onIterationsChange}
                  readOnly={processing}
                  onValidationChange={setConfigValid}
                />
                <div
                  css={css`
                    margin-right: 10px;
                    white-space: nowrap;
                  `}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={markovChain}
                        onChange={() => setMarkovChain((prev) => !prev)}
                        disabled={processing}
                      />
                    }
                    label="Markov Chain"
                  />
                </div>
                <ConfigNumberInputWithLabel
                  label="q:"
                  initialValue={q}
                  inputValueValid={isInputValueValidQ}
                  disabled={!markovChain}
                  readOnly={processing}
                  onValidChange={onQChange}
                  onValidationChange={setConfigValid}
                  inputProps={{
                    step: '0.001',
                    min: '0',
                    max: '1',
                  }}
                />
              </div>
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Button
                  variant="outlined"
                  color="error"
                  disabled={processing}
                  onClick={resetOnClick}
                  css={css`
                    margin-right: 10px;
                  `}
                >
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  disabled={!canRemoveBox || processing}
                  onClick={onRemoveBoxClick}
                  css={css`
                    margin-right: 10px;
                  `}
                >
                  <Remove />
                </Button>
                <Button
                  variant="outlined"
                  css={css`
                    margin-right: 10px;
                  `}
                  disabled={processing}
                  onClick={onAddBoxClick}
                >
                  <Add />
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!configValid || processing}
                >
                  Generate More
                </Button>
              </div>
            </div>
            <div
              css={css`
                display: flex;
                justify-content: space-between;
              `}
            >
              <div
                css={css`
                  display: flex;
                  align-items: baseline;
                `}
              >
                <div
                  css={css`
                    margin: 0 10px 0 0;
                  `}
                >
                  Periods:
                </div>
                <ConfigNumberInputWithLabel
                  label="xShift:"
                  initialValue={periods.xShift}
                  inputValueValid={isInputValueValidPeriod}
                  onValidChange={(xShift) => {
                    onPeriodsChange({ ...periods, xShift });
                  }}
                  readOnly={processing}
                  inputProps={{
                    step: '1',
                    min: '0',
                  }}
                  onValidationChange={setConfigValid}
                />
                <ConfigNumberInputWithLabel
                  label="yShift:"
                  initialValue={periods.yShift}
                  inputValueValid={isInputValueValidPeriod}
                  onValidChange={(yShift) => {
                    onPeriodsChange({ ...periods, yShift });
                  }}
                  readOnly={processing}
                  inputProps={{
                    step: '1',
                    min: '0',
                  }}
                  onValidationChange={setConfigValid}
                />
                <ConfigNumberInputWithLabel
                  label="zHeight:"
                  initialValue={periods.zHeight}
                  inputValueValid={isInputValueValidPeriod}
                  onValidChange={(zHeight) => {
                    onPeriodsChange({ ...periods, zHeight });
                  }}
                  readOnly={processing}
                  inputProps={{
                    step: '1',
                    min: '0',
                  }}
                  onValidationChange={setConfigValid}
                />
                <div
                  css={css`
                    margin: 0 10px 0 30px;
                    white-space: nowrap;
                  `}
                >
                  Draw dist:
                </div>

                <ConfigNumberInputWithLabel
                  label="x:"
                  initialValue={drawDistance.x}
                  inputValueValid={isInputValueValidDrawDistance}
                  onValidChange={(x) => {
                    onDrawDistanceChange({ ...drawDistance, x });
                  }}
                  readOnly={processing}
                  inputProps={{
                    step: '1',
                    min: '1',
                  }}
                  onValidationChange={setConfigValid}
                  css={css`
                    margin-right: 10px;
                  `}
                />
                <ConfigNumberInputWithLabel
                  label="y:"
                  initialValue={drawDistance.y}
                  inputValueValid={isInputValueValidDrawDistance}
                  onValidChange={(y) => {
                    onDrawDistanceChange({ ...drawDistance, y });
                  }}
                  readOnly={processing}
                  inputProps={{
                    step: '1',
                    min: '1',
                  }}
                  onValidationChange={setConfigValid}
                  css={css`
                    margin-right: 10px;
                  `}
                />
                <ConfigNumberInputWithLabel
                  label="z:"
                  initialValue={drawDistance.z}
                  inputValueValid={isInputValueValidDrawDistance}
                  onValidChange={(z) => {
                    onDrawDistanceChange({ ...drawDistance, z });
                  }}
                  readOnly={processing}
                  inputProps={{
                    step: '1',
                    min: '1',
                  }}
                  onValidationChange={setConfigValid}
                  css={css`
                    margin-right: 10px;
                  `}
                />
              </div>
            </div>
          </Panel>
        </form>
        <Panel
          css={css`
            flex: 1 1 100%;
          `}
        >
          <MainScene walls={walls} boxes={boxes} boxCounts={boxCounts} />
        </Panel>
      </div>
    </StyleProvider>
  );
}

export default App;
