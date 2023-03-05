import { Paper, css, styled } from '@mui/material';
import MainScene from './components/MainScene';

import StyleProvider from './components/StyleProvider';

import ProcessingWithProgress from './components/ProcessingWithProgress';
import ConfigurationForm from './components/ConfigurationForm';

const Panel = styled(Paper)`
  padding: 10px;
`;

const AppContent = styled('div')`
  height: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
`;

function App() {
  return (
    <StyleProvider>
      <ProcessingWithProgress />
      <AppContent>
        <Panel
          css={css`
            margin-bottom: 20px;
            width: 100%;
          `}
        >
          <ConfigurationForm />
        </Panel>
        <Panel
          css={css`
            flex: 1 1 100%;
          `}
        >
          <MainScene />
        </Panel>
      </AppContent>
    </StyleProvider>
  );
}

export default App;
