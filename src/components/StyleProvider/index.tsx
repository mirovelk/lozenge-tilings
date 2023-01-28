import { css, Global } from '@emotion/react';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function StyleProvider({ children }: Props) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Global
        styles={css`
          html,
          body,
          #root {
            height: 100%;
            min-width: 950px;
          }
        `}
      />
      {children}
    </ThemeProvider>
  );
}

export default StyleProvider;
