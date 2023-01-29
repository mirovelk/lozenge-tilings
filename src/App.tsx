import { Button, Paper, css, styled } from '@mui/material';
import { useCallback } from 'react';
import MainScene from './components/MainScene';
import ConfigNumberInputWithLabel from './components/ConfigNumberInputWithLabel';

import StyleProvider from './components/StyleProvider';
import {
  iterationsUpdated,
  pXUpdated,
  pYUpdated,
  pZUpdated,
  selectIsConfigValid,
  selectIterations,
  selectPeriods,
} from './redux/features/config/configSlice';
import { generate } from './redux/features/generate/generateSlice';
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
  const { pX, pY, pZ } = useAppSelector(selectPeriods);

  const configValid = useAppSelector(selectIsConfigValid);

  const onIterationsChange = useCallback(
    (interations: number) => {
      dispatch(iterationsUpdated({ interations }));
    },
    [dispatch]
  );

  const onPeriodXChange = useCallback(
    (period: number) => {
      dispatch(pXUpdated({ period }));
    },
    [dispatch]
  );

  const onPeriodYChange = useCallback(
    (period: number) => {
      dispatch(pYUpdated({ period }));
    },
    [dispatch]
  );

  const onPeriodZChange = useCallback(
    (period: number) => {
      dispatch(pZUpdated({ period }));
    },
    [dispatch]
  );

  const generateTiling = useCallback(() => {
    dispatch(
      generate({
        iterations,
        periods: { pX, pY, pZ },
      })
    );
  }, [dispatch, iterations, pX, pY, pZ]);

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
              initialValue={10_000}
              inputValueValid={(value) => value !== '' && Number(value) > 0}
              onValidChange={onIterationsChange}
            />
            <ConfigNumberInputWithLabel
              label="pX:"
              initialValue={0}
              inputValueValid={isInputValueValidPeriod}
              onValidChange={onPeriodXChange}
            />
            <ConfigNumberInputWithLabel
              label="pY:"
              initialValue={0}
              inputValueValid={isInputValueValidPeriod}
              onValidChange={onPeriodYChange}
            />
            <ConfigNumberInputWithLabel
              label="pZ:"
              initialValue={0}
              inputValueValid={isInputValueValidPeriod}
              onValidChange={onPeriodZChange}
            />
          </div>
          <div>
            <Button
              variant="contained"
              onClick={generateTiling}
              disabled={!configValid}
            >
              Generate
            </Button>
          </div>
        </Panel>
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
