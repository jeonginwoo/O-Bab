'use client';
import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';

// This is the default Emotion cache for the client-side.
const primaryCache = createCache({ key: 'mui', prepend: true });

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [emotionCache] = React.useState(createCache({ key: 'css', prepend: true }));

  useServerInsertedHTML(() => {
    const serialized = emotionCache.key + '-' + emotionCache.sheet.tags.join(' ');
    // eslint-disable-next-line react/no-danger
    return (
      <style
        data-emotion={`${emotionCache.key} ${serialized}`}
        dangerouslySetInnerHTML={{ __html: emotionCache.sheet.css }}
      />
    );
  });

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}