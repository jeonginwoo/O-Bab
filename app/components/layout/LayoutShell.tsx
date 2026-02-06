"use client";
import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMapPage = pathname === '/map';

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        {!isMapPage && <Footer />}
      </Box>
    </div>
  );
}
