"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GameContainer from "./components/game/GameContainer";
import Menu from "./components/menu/Menu";
import Image from "next/image";
import React, { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  useTheme,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Grow,
} from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import { useThemeContext } from "./theme/ThemeContext";
import { themeOptions } from "./theme/theme";

export default function Home() {
  const dontoUrl =
    "https://pf.kakao.com/rocket-web/web/profiles/_xilxcBn/posts?includePinnedPost=true";
  const yunsUrl =
    "https://pf.kakao.com/rocket-web/web/profiles/_aKxdLs/posts?includePinnedPost=true";
  const theme = useTheme();
  const { currentTheme, setTheme } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handlePaletteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "theme-popover" : undefined;

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppBar
          position="static"
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.secondary.main}`,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ width: 40 }} /> {/* Spacer to center the logo */}
            <Box sx={{ py: 1, display: "flex", alignItems: "center" }}>
              <Image
                src="/logo.png"
                alt="5뭐?"
                width={160}
                height={73}
                priority
                style={{ height: "auto" }}
              />
            </Box>
            <Box>
              <IconButton
                color="inherit"
                aria-describedby={id}
                onClick={handlePaletteClick}
                sx={{ color: theme.palette.text.primary }}
              >
                <PaletteIcon />
              </IconButton>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                PaperProps={{
                  sx: {
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    overflow: "visible", // Ensure tooltips aren't cut off if any
                  },
                }}
              >
                <Stack direction="column" spacing={1} sx={{ p: 1 }}>
                  {Object.entries(themeOptions).map(([key, option], index) => {
                    const primary = (option.palette?.primary as any)?.main;
                    const secondary = (option.palette?.secondary as any)?.main;
                    const background = (option.palette?.background as any)?.default;
                    return (
                      <Grow
                        key={key}
                        in={open}
                        style={{ transformOrigin: "0 0 0" }}
                        {...(open ? { timeout: 300 + index * 100 } : {})}
                      >
                        <Tooltip title={key} placement="left">
                          <IconButton
                            onClick={() => setTheme(key)}
                            sx={{ p: 0.5 }} // Padding for the border/selection ring
                          >
                            <Box
                              sx={{
                                width: currentTheme === key ? 28 : 24,
                                height: currentTheme === key ? 28 : 24,
                                borderRadius: "50%",
                                background: `linear-gradient(90deg, ${background} 50%, ${secondary} 50%)`,
                                border: `2px solid ${background}`,
                                boxShadow: 3,
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Grow>
                    );
                  })}
                </Stack>
              </Popover>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: theme.spacing(3),
            }}
          >
            <Box sx={{ flex: "1 1 300px" }}>
              <Menu title="돈토" apiUrl={dontoUrl} />
            </Box>
            <Box sx={{ flex: "1 1 300px" }}>
              <Menu title="윤스" apiUrl={yunsUrl} />
            </Box>
            <Box sx={{ flex: "1 1 300px" }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ height: "100%" }}>
                  <GameContainer />
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>

        <AppBar
          position="static"
          sx={{ backgroundColor: theme.palette.background.paper, mt: "auto" }}
        >
          <Toolbar>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flexGrow: 1, textAlign: "center" }}
            >
              밥밥밥 ver 3.4.2
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
}
