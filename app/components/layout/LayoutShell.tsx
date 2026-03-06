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

  const sec  = theme.palette.secondary.main;
  const pri  = theme.palette.primary.main;
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
          background: `radial-gradient(ellipse at 38% 38%, ${sec}${isDark ? '28' : '45'} 0%, ${sec}${isDark ? '0c' : '18'} 50%, transparent 75%)`,
          willChange: 'opacity',
          transform: 'translateZ(0)',
          animation: 'aurora 12s ease-in-out infinite',
        }} />

        {/* Aurora blob — bottom-right */}
        <Box sx={{
          position: 'absolute',
          bottom: '-22%', right: '-12%',
          width: '65vw', height: '65vw',
          borderRadius: '55% 45% 42% 58% / 46% 56% 44% 54%',
          background: `radial-gradient(ellipse at 62% 62%, ${sec}${isDark ? '24' : '42'} 0%, ${pri}${isDark ? '10' : '28'} 45%, transparent 72%)`,
          willChange: 'opacity',
          transform: 'translateZ(0)',
          animation: 'aurora 16s ease-in-out infinite 4s',
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
