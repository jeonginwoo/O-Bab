"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Menu from "./components/menu/Menu";
import React from "react";
import {
  Box,
  Container,
  Typography,
  useTheme,
} from "@mui/material";

export default function Home() {
  const dontoUrl =
    "https://pf.kakao.com/rocket-web/web/profiles/_xilxcBn/posts?includePinnedPost=true";
  const yunsUrl =
    "https://pf.kakao.com/rocket-web/web/profiles/_aKxdLs/posts?includePinnedPost=true";
  const theme = useTheme();

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>

        {/* Menu cards */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: theme.spacing(3),
          }}
        >
          <Box
            className="animate-fade-in-up stagger-1"
            sx={{ flex: "1 1 400px" }}
          >
            <Menu title="돈토" apiUrl={dontoUrl} />
          </Box>
          <Box
            className="animate-fade-in-up stagger-2"
            sx={{ flex: "1 1 400px" }}
          >
            <Menu title="윤스" apiUrl={yunsUrl} />
          </Box>
        </Box>
      </Container>
    </>
  );
}
