import { createTheme } from '@mui/material/styles';

// Sweepstouch pink palette (matches https://www.sweepstouch.com)
export const sweepstouchTheme = createTheme({
  palette: {
    primary: {
      main: '#ff0f6e',
      dark: '#c10061',
      light: '#ff4fa0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff4fa0',
      dark: '#c10061',
      light: '#ffe6f2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
    },
  },
});
