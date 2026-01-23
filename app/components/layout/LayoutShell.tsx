"use client";
import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Box } from '@mui/material';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </div>
  );
}
