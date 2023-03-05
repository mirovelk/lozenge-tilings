import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import App from './App';
import { lozengeTilingComlink } from './lozengeTilingComlink';

await lozengeTilingComlink.init();

const container = document.getElementById('root');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
