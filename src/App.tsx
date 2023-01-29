import { Button, Paper, css, styled, Input, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import MainScene from './components/MainScene';

import StyleProvider from './components/StyleProvider';
import { generate } from './redux/features/generate/generateSlice';
import { useAppDispatch } from './redux/store';

const Panel = styled(Paper)`
  padding: 10px;
`;

function App() {
  const dispatch = useAppDispatch();

  const [iterationsInputValue, setIterationsInputValue] =
    useState<string>('10000');
  const [iterationsValid, setIterationsValid] = useState(true);

  const onIterationsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIterationsInputValue(e.target.value);

      if (e.target.value === '' || Number(e.target.value) < 0) {
        setIterationsValid(false);
      } else {
        setIterationsValid(true);
      }
    },
    []
  );

  const generateTiling = useCallback(() => {
    dispatch(generate({ iterations: Number(iterationsInputValue) }));
  }, [dispatch, iterationsInputValue]);

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
          <div>
            <div
              css={css`
                display: flex;
              `}
            >
              <Typography
                variant="subtitle1"
                color="text.secondary"
                css={css`
                  margin-right: 10px;
                `}
              >
                Iterations:
              </Typography>
              <Input
                value={iterationsInputValue}
                type="number"
                error={!iterationsValid}
                onChange={onIterationsChange}
                css={css`
                  margin-right: 10px;
                `}
              />
            </div>
          </div>
          <div>
            <Button
              variant="contained"
              onClick={generateTiling}
              disabled={!iterationsValid}
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
