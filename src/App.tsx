import { Button, Paper, css, styled } from '@mui/material';
import { useCallback, useEffect } from 'react';
import MainScene from './components/MainScene';
import ConfigNumberInputWithLabel from './components/ConfigNumberInputWithLabel';

import StyleProvider from './components/StyleProvider';

import {
  addRandomBox,
  generate,
  iterationsUpdated,
  periodUpdated,
  selectCanAddBox,
  selectCanGenerate,
  selectCanRemoveBox,
  selectIterations,
  selectPeriods,
} from './redux/features/lozengeTiling/lozengeTilingSlice';
import { useAppDispatch, useAppSelector } from './redux/store';

const Panel = styled(Paper)`
  padding: 10px;
`;

function isInputValueValidPeriod(value: string) {
  return value !== '' && Number(value) >= 0;
}

function App() {
  const dispatch = useAppDispatch();

  const iterations = useAppSelector(selectIterations);
  const periods = useAppSelector(selectPeriods);

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

  const onPeriodZChange = useCallback(
    (zHeight: number) => {
      dispatch(periodUpdated({ zHeight }));
    },
    [dispatch]
  );

  const generateTiling = useCallback(() => {
    dispatch(
      generate({
        iterations,
        periods,
      })
    );
  }, [dispatch, iterations, periods]);

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
                label="Iterations:"
                initialValue={iterations}
                inputValueValid={(value) => value !== '' && Number(value) > 0}
                onValidChange={onIterationsChange}
              />
              <ConfigNumberInputWithLabel
                label="xShift:"
                initialValue={periods.xShift}
                inputValueValid={isInputValueValidPeriod}
                onValidChange={onPeriodXChange}
              />
              <ConfigNumberInputWithLabel
                label="yShift:"
                initialValue={periods.yShift}
                inputValueValid={isInputValueValidPeriod}
                onValidChange={onPeriodYChange}
              />
              <ConfigNumberInputWithLabel
                label="zHeight:"
                initialValue={periods.zHeight}
                inputValueValid={isInputValueValidPeriod}
                onValidChange={onPeriodZChange}
              />
            </div>
            <div
              css={css`
                display: flex;
              `}
            >
              <Button
                variant="contained"
                type="submit"
                disabled={!canGenerate}
                css={css`
                  margin-right: 10px;
                `}
              >
                Generate
              </Button>
              <Button
                variant="outlined"
                disabled={!canAddBox}
                css={css`
                  margin-right: 10px;
                `}
                onClick={onAddBoxClick}
              >
                +
              </Button>
              <Button variant="outlined" disabled={!canRemoveBox}>
                -
              </Button>
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
