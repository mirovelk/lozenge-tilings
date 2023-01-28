import { Button, Paper, css, styled } from '@mui/material';
import { useCallback } from 'react';
import MainScene from './components/MainScene';

import StyleProvider from './components/StyleProvider';
import { generate } from './redux/features/generate/generateSlice';
import { useAppDispatch } from './redux/store';

const Panel = styled(Paper)`
  padding: 10px;
`;

function App() {
  const dispatch = useAppDispatch();

  const generateTiling = useCallback(() => {
    dispatch(generate({ iterations: 10000 }));
  }, [dispatch]);

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
          `}
        >
          <Button variant="contained" onClick={generateTiling}>
            Generate
          </Button>
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
