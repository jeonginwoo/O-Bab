"use client";
import { createContext, useContext } from "react";

interface ThemeContextType {
  currentTheme: string;
  setTheme: (name: string) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  currentTheme: "dark",
  setTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);
