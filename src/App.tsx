import {
  Button,
  Paper,
  css,
  styled,
  Checkbox,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import { useCallback, useState } from 'react';
import MainScene from './components/MainScene';
import ConfigNumberInputWithLabel from './components/ConfigNumberInputWithLabel';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import StyleProvider from './components/StyleProvider';

import { Add, Remove } from '@mui/icons-material';
import {
  addBoxAtom,
  canRemoveBoxAtom,
  drawDistanceAtom,
  generateTilingAtom,
  iterationsAtom,
  markovChainAtom,
  periodsAtom,
  processingAtom,
  qAtom,
  removeBoxAtom,
  resetAtom,
  showProgressAtom,
} from './appState';

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

function App() {
  // TODO better validation
  const [configValid, setConfigValid] = useState(true);

  // TODO separate into smaller components
  const processing = useAtomValue(processingAtom);
  const showProgress = useAtomValue(showProgressAtom);

  const [iterations, setIterations] = useAtom(iterationsAtom);
  const [q, setQ] = useAtom(qAtom);

  const [periods, setPeriods] = useAtom(periodsAtom);
  const [drawDistance, setDrawDistance] = useAtom(drawDistanceAtom);

  const [canRemoveBox] = useAtom(canRemoveBoxAtom);

  const [markovChain, setMarkovChain] = useAtom(markovChainAtom);

  const generateTiling = useSetAtom(generateTilingAtom);
  const removeBox = useSetAtom(removeBoxAtom);
  const addBox = useSetAtom(addBoxAtom);
  const reset = useSetAtom(resetAtom);

  const onConfigSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (configValid && !processing) {
        await generateTiling();
      }
    },
    [configValid, generateTiling, processing]
  );

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
                  onValidChange={(iterations) => setIterations(iterations)}
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
                  onValidChange={(q) => setQ(q)}
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
                  onClick={reset}
                  css={css`
                    margin-right: 10px;
                  `}
                >
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  disabled={!canRemoveBox || processing}
                  onClick={removeBox}
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
                  onClick={addBox}
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
                    setPeriods({ ...periods, xShift });
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
                    setPeriods({ ...periods, yShift });
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
                    setPeriods({ ...periods, zHeight });
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
                    setDrawDistance({ x });
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
                    setDrawDistance({ y });
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
                    setDrawDistance({ z });
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
          <MainScene />
        </Panel>
      </div>
    </StyleProvider>
  );
}

export default App;
