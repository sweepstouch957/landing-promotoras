'use client';

import * as React from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { sweepstouchTheme } from './theme';

export default function MuiThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={sweepstouchTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
