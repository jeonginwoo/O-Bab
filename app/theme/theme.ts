"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0A192F",
    },
    secondary: {
      main: "#64FFDA",
    },
    background: {
      default: "#0A192F",
      paper: "#172A45",
    },
    text: {
      primary: "#CCD6F6",
      secondary: "#8892B0",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: {
      color: "#64FFDA",
    },
    h2: {
      color: "#64FFDA",
    },
  },
});

export default theme;
