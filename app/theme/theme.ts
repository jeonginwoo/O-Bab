"use client";
import { createTheme, ThemeOptions } from "@mui/material/styles";

const typography = {
  fontFamily: "Roboto, sans-serif",
  h1: {
    color: "#0A192F",
  },
  h2: {
    color: "#0A192F",
  },
};

export const themeOptions: Record<string, ThemeOptions> = {
  dark: {
    palette: {
      mode: "dark",
      primary: {
        main: "#64FFDA",
      },
      secondary: {
        main: "#0A192F",
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
  ocean: {
    palette: {
      mode: "dark",
      primary: {
        main: "#00e5ff",
      },
      secondary: {
        main: "#002b5c",
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
  light: {
    palette: {
      mode: "light",
      primary: {
        main: "#9c27b0",
      },
      secondary: {
        main: "#1976d2",
      },
      background: {
        default: "#f8f6ff",
        paper: "#ffffff",
      },
      text: {
        primary: "#000000",
        secondary: "#666666",
      },
    },
    typography: {
      ...typography,
      h1: { color: "#9c27b0" },
      h2: { color: "#9c27b0" },
    },
  },
  forest: {
    palette: {
      mode: "light",
      primary: {
        main: "#ff6f00",
      },
      secondary: {
        main: "#2e7d32",
      },
      background: {
        default: "#f4fbf4",
        paper: "#ffffff",
      },
    },
    typography: {
      ...typography,
      h1: { color: "#ff6f00" },
      h2: { color: "#ff6f00" },
    },
  },
  coffee: {
    palette: {
      mode: "light",
      primary: {
        main: "#ffa000",
      },
      secondary: {
        main: "#795548",
      },
      background: {
        default: "#faf7f5",
        paper: "#ffffff",
      },
      text: {
        primary: "#3e2723",
        secondary: "#5d4037",
      },
    },
    typography: {
      ...typography,
      h1: { color: "#ffa000" },
      h2: { color: "#ffa000" },
    },
  },
  lavender: {
    palette: {
      mode: "light",
      primary: {
        main: "#f06292",
      },
      secondary: {
        main: "#673ab7",
      },
      background: {
        default: "#fdf6ff",
        paper: "#ffffff",
      },
      text: {
        primary: "#311b92",
        secondary: "#6a1b9a",
      },
    },
    typography: {
      ...typography,
      h1: { color: "#f06292" },
      h2: { color: "#f06292" },
    },
  },
  oliveMeadow: {
    palette: {
      mode: "light",
      primary: {
        main: "#d4956a",
      },
      secondary: {
        main: "#89986D",
      },
      background: {
        default: "#fdfaf0",
        paper: "#ffffff",
      },
      text: {
        primary: "#556047",
        secondary: "#89986D",
      },
    },
    typography: {
      ...typography,
      h1: { color: "#d4956a" },
      h2: { color: "#d4956a" },
    },
  },
};

export const themeMarblePalettes: Record<string, number[]> = {
  // Dark: Neon Mint/Cyan/Pink for high contrast
  dark: [160, 190, 210, 260, 320, 340, 25, 50, 120],
  
  // Ocean: Range of blues, Cyans, Teals, and a touch of coral
  ocean: [160, 170, 180, 190, 200, 210, 220, 230, 240, 330],
  
  // Light: Bright primary rainbow
  light: [0, 30, 60, 120, 180, 210, 270, 300, 330],
  
  // Forest: Greens, Earthy Browns (Oranges), Sky Blue, Flora Reds
  forest: [90, 100, 110, 120, 130, 140, 30, 45, 200, 350],
  
  // Coffee: Warm tones - Oranges, Yellows, Red-Browns
  coffee: [20, 25, 30, 35, 40, 45, 10, 15, 5, 0],
  
  // Lavender: Purples, Violets, Pinks, Soft Blues
  lavender: [240, 250, 260, 270, 280, 290, 300, 310, 320, 200],
  
  // Olive Meadow: Yellow-Greens, Olives, Pale yellows
  oliveMeadow: [60, 70, 80, 90, 100, 45, 50, 55, 120],
};


export const createCustomTheme = (themeName: string) => {
  return createTheme(themeOptions[themeName] || themeOptions["dark"]);
};