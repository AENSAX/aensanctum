'use client';

import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-geist-sans), sans-serif',
  },
  palette: {
    mode: 'light',
    primary: {
      main: alpha('#ee96b0', 0.5),
    },
    secondary: {
      main: '#e6b3cc',
    },
  },
});

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
} 