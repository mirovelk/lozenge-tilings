import {
  Button,
  Paper,
  css,
  styled,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import MainScene from './components/MainScene';
import ConfigNumberInputWithLabel from './components/ConfigNumberInputWithLabel';

import StyleProvider from './components/StyleProvider';

import {
  addRandomBox,
  drawDistanceUpdated,
  generateByAddingOnly,
  generateWithMarkovChain,
  iterationsUpdated,
  periodUpdated,
  qUpdated,
  removeRandomBox,
  selectCanAddBox,
  selectCanGenerate,
  selectCanRemoveBox,
  selectDrawDistance,
  selectIterations,
  selectPeriods,
  selectQ,
} from './redux/features/lozengeTiling/lozengeTilingSlice';
import { useAppDispatch, useAppSelector } from './redux/store';
import { Add, Remove } from '@mui/icons-material';

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
  const dispatch = useAppDispatch();

  const iterations = useAppSelector(selectIterations);
  const periods = useAppSelector(selectPeriods);
  const q = useAppSelector(selectQ);
  const drawDistance = useAppSelector(selectDrawDistance);

  const [markovChain, setMarkovChain] = useState(true);

  const canGenerate = useAppSelector(selectCanGenerate);
  const canAddBox = useAppSelector(selectCanAddBox);
  const canRemoveBox = useAppSelector(selectCanRemoveBox);

  const onIterationsChange = useCallback(
    (interations: number) => {
      dispatch(iterationsUpdated({ interations }));
    },
    [dispatch]
  );

  const onPeriodXChange = useCallback(
    (xShift: number) => {
      dispatch(periodUpdated({ xShift }));
    },
    [dispatch]
  );

  const onPeriodYChange = useCallback(
    (yShift: number) => {
      dispatch(periodUpdated({ yShift }));
    },
    [dispatch]
  );

  const onQChange = useCallback(
    (q: number) => {
      dispatch(qUpdated({ q }));
    },
    [dispatch]
  );

  const onPeriodZChange = useCallback(
    (zHeight: number) => {
      dispatch(periodUpdated({ zHeight }));
    },
    [dispatch]
  );

  const onDrawDistanceChange = useCallback(
    (drawDistance: number) => {
      dispatch(drawDistanceUpdated({ drawDistance }));
    },
    [dispatch]
  );

  const generateTiling = useCallback(() => {
    if (markovChain) {
      dispatch(generateWithMarkovChain());
    } else {
      dispatch(generateByAddingOnly());
    }
  }, [dispatch, markovChain]);

  const onConfigSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (canGenerate) {
        generateTiling();
      }
    },
    [canGenerate, generateTiling]
  );

  const onAddBoxClick = useCallback(() => {
    if (canAddBox) {
      dispatch(addRandomBox());
    }
  }, [canAddBox, dispatch]);

  const onRemoveBoxClick = useCallback(() => {
    if (canRemoveBox) {
      dispatch(removeRandomBox());
    }
  }, [canRemoveBox, dispatch]);

  // auto generate on start
  useEffect(() => {
    generateTiling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run once

  return (
    <StyleProvider>
      <div
        css={css`
          height: 100%;
          padding: 20px 15px;
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
                  onValidChange={onQChange}
                  inputProps={{
                    step: '0.001',
                    min: '0',
                    max: '1',
                  }}
                />
              </div>
              <div>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!canGenerate}
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
                `}
              >
                <ConfigNumberInputWithLabel
                  label="xShift:"
                  initialValue={periods.xShift}
                  inputValueValid={isInputValueValidPeriod}
                  onValidChange={onPeriodXChange}
                  inputProps={{
                    step: '1',
                    min: '0',
                  }}
                />
                <ConfigNumberInputWithLabel
                  label="yShift:"
                  initialValue={periods.yShift}
                  inputValueValid={isInputValueValidPeriod}
                  onValidChange={onPeriodYChange}
                  inputProps={{
                    step: '1',
                    min: '0',
                  }}
                />
                <ConfigNumberInputWithLabel
                  label="zHeight:"
                  initialValue={periods.zHeight}
                  inputValueValid={isInputValueValidPeriod}
                  onValidChange={onPeriodZChange}
                  inputProps={{
                    step: '1',
                    min: '0',
                  }}
                />
                <ConfigNumberInputWithLabel
                  label="draw dist:"
                  initialValue={drawDistance}
                  inputValueValid={isInputValueValidDrawDistance}
                  onValidChange={onDrawDistanceChange}
                  inputProps={{
                    step: '1',
                    min: '1',
                  }}
                  css={css`
                    margin-right: 10px;
                  `}
                />
              </div>
              <div
                css={css`
                  white-space: nowrap;
                `}
              >
                <Button
                  variant="outlined"
                  disabled={!canAddBox}
                  css={css`
                    margin-right: 10px;
                  `}
                  onClick={onAddBoxClick}
                >
                  <Add />
                </Button>
                <Button
                  variant="outlined"
                  disabled={!canRemoveBox}
                  onClick={onRemoveBoxClick}
                >
                  <Remove />
                </Button>
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
