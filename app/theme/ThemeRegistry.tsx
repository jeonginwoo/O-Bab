"use client";
import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createCustomTheme, themeOptions } from "./theme";
import { ThemeContext } from "./ThemeContext";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [emotionCache] = React.useState(() =>
    createCache({ key: "css", prepend: true })
  );
  const [currentTheme, setCurrentTheme] = React.useState("dark");

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && themeOptions[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const handleSetTheme = React.useCallback((name: string) => {
    setCurrentTheme(name);
    localStorage.setItem("theme", name);
  }, []);

  const theme = React.useMemo(() => createCustomTheme(currentTheme), [currentTheme]);

  const themeContextValue = React.useMemo(
    () => ({ currentTheme, setTheme: handleSetTheme }),
    [currentTheme, handleSetTheme]
  );

  useServerInsertedHTML(() => {
    const serialized =
      emotionCache.key + "-" + emotionCache.sheet.tags.join(" ");

    return (
      <style
        data-emotion={`${emotionCache.key} ${serialized}`}
        dangerouslySetInnerHTML={{ __html: emotionCache.sheet.toString() }}
      />
    );
  });

  return (
    <CacheProvider value={emotionCache}>
      <ThemeContext.Provider value={themeContextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeContext.Provider>
    </CacheProvider>
  );
}
