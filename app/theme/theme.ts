"use client";
import { createTheme, ThemeOptions } from "@mui/material/styles";

const typography = {
  fontFamily: "Roboto, sans-serif",
  h1: {
    color: "#64FFDA",
  },
  h2: {
    color: "#64FFDA",
  },
};

export const themeOptions: Record<string, ThemeOptions> = {
  dark: {
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
    typography,
  },
  light: {
    palette: {
      mode: "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#9c27b0",
      },
      background: {
        default: "#f5f5f5",
        paper: "#ffffff",
      },
      text: {
        primary: "#000000",
        secondary: "#666666",
      },
    },
    typography: {
      ...typography,
      h1: { color: "#1976d2" },
      h2: { color: "#1976d2" },
    },
  },
  forest: {
    palette: {
      mode: "light",
      primary: {
        main: "#2e7d32",
      },
      secondary: {
        main: "#ff6f00",
      },
      background: {
        default: "#e8f5e9",
        paper: "#ffffff",
      },
    },
    typography: {
      ...typography,
      h1: { color: "#2e7d32" },
      h2: { color: "#2e7d32" },
    },
  },
  ocean: {
    palette: {
      mode: "dark",
      primary: {
        main: "#0077be",
      },
      secondary: {
        main: "#00e5ff",
      },
      background: {
        default: "#001e3c",
        paper: "#0a2744",
      },
      text: {
        primary: "#e3f2fd",
        secondary: "#90caf9",
      },
    },
    typography: {
      ...typography,
      h1: { color: "#00e5ff" },
      h2: { color: "#00e5ff" },
    },
  },
  sunset: {
    palette: {
      mode: "dark",
      primary: {
        main: "#ff5722",
      },
      secondary: {
        main: "#d500f9",
      },
      background: {
        default: "#210a0a",
        paper: "#331010",
      },
      text: {
        primary: "#fff3e0",
        secondary: "#ffccbc",
      },
    },
    typography: {
      ...typography,
      h1: { color: "#ff5722" },
      h2: { color: "#ff5722" },
    },
  },
  coffee: {
    palette: {
      mode: "light",
      primary: {
        main: "#795548",
      },
      secondary: {
        main: "#d7ccc8",
      },
      background: {
        default: "#efebe9",
        paper: "#ffffff",
      },
      text: {
        primary: "#3e2723",
        secondary: "#5d4037",
      },
    },
    typography: {
      ...typography,
      h1: { color: "#795548" },
      h2: { color: "#795548" },
    },
  },
  lavender: {
    palette: {
      mode: "light",
      primary: {
        main: "#673ab7",
      },
      secondary: {
        main: "#e040fb",
      },
      background: {
        default: "#f3e5f5",
        paper: "#ffffff",
      },
      text: {
        primary: "#311b92",
        secondary: "#6a1b9a",
      },
    },
    typography: {
      ...typography,
      h1: { color: "#673ab7" },
      h2: { color: "#673ab7" },
    },
  },
};

export const createCustomTheme = (themeName: string) => {
  return createTheme(themeOptions[themeName] || themeOptions["dark"]);
};