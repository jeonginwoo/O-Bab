"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Grow,
  Button,
  useTheme,
} from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import { useThemeContext } from "../../theme/ThemeContext";
import { themeOptions } from "../../theme/theme";

export default function Navigation() {
  const theme = useTheme();
  const pathname = usePathname();
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

  const navItems = [
    { label: "오밥뭐?", path: "/" },
    { label: "사다리타기", path: "/ladder" },
    { label: "맛집", path: "/map" },
  ];

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.secondary.main}`,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
           {/* Logo - kept for branding */}
           <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image
                src="/logo.png"
                alt="5뭐?"
                width={100}
                height={45}
                priority
                style={{ height: "auto" }}
              />
           </Link>

           {/* Navigation Links */}
           <Stack direction="row" spacing={1}>
             {navItems.map((item) => (
               <Button
                 key={item.path}
                 component={Link}
                 href={item.path}
                 sx={{ 
                   fontWeight: pathname === item.path ? "bold" : "normal",
                   color: pathname === item.path ? theme.palette.secondary.main : theme.palette.text.primary 
                  }}
               >
                 {item.label}
               </Button>
             ))}
           </Stack>
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
                overflow: "visible",
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
                        sx={{ p: 0.5 }}
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
  );
}
