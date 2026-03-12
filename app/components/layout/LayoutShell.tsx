"use client";
import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Box, useTheme } from '@mui/material';
import { usePathname } from 'next/navigation';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const theme = useTheme();

  const sec  = theme.palette.primary.main;
  const pri  = theme.palette.secondary.main;
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Background canvas ────────────────────────────── */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          contain: 'layout style paint',
        }}
      >

        {/* Aurora blob — top-left */}
        <Box sx={{
          position: 'absolute',
          top: '-20%', left: '-15%',
          width: '70vw', height: '70vw',
          borderRadius: '42% 58% 55% 45% / 52% 44% 56% 48%',
          background: `radial-gradient(ellipse at 38% 38%, ${sec}${isDark ? '2a' : '48'} 0%, ${sec}${isDark ? '22' : '38'} 20%, ${sec}${isDark ? '16' : '28'} 38%, ${sec}${isDark ? '0a' : '14'} 56%, ${sec}${isDark ? '03' : '06'} 68%, transparent 78%)`,
          filter: 'blur(32px)',
          transform: 'translateZ(0)',
        }} />

        {/* Aurora blob — bottom-right */}
        <Box sx={{
          position: 'absolute',
          bottom: '-22%', right: '-12%',
          width: '65vw', height: '65vw',
          borderRadius: '55% 45% 42% 58% / 46% 56% 44% 54%',
          background: `radial-gradient(ellipse at 62% 62%, ${sec}${isDark ? '26' : '44'} 0%, ${sec}${isDark ? '1c' : '34'} 18%, ${pri}${isDark ? '14' : '2a'} 34%, ${pri}${isDark ? '0a' : '18'} 50%, ${pri}${isDark ? '03' : '08'} 64%, transparent 76%)`,
          filter: 'blur(40px)',
          transform: 'translateZ(0)',
        }} />

      </Box>
      {/* ─────────────────────────────────────────────────── */}

      {/* Content layer */}
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        {isHomePage && <Footer />}
      </Box>
    </Box>
  );
}
