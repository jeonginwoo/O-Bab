'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0A192F', // --primary-color
    },
    secondary: {
      main: '#64FFDA', // --accent-color
    },
    background: {
      default: '#0A192F', // --background-color
      paper: '#172A45',    // --secondary-color
    },
    text: {
      primary: '#CCD6F6',   // --text-color
      secondary: '#8892B0', // --light-text-color
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
        color: '#64FFDA' // --accent-color
    },
    h2: {
        color: '#64FFDA' // --accent-color
    },
  },
});

export default theme;
