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
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import MenuIcon from "@mui/icons-material/Menu";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { useThemeContext } from "../../theme/ThemeContext";
import { themeOptions } from "../../theme/theme";

export default function Navigation() {
  const theme = useTheme();
  const pathname = usePathname();
  const { currentTheme, setTheme } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState<HTMLElement | null>(null);

  const handlePaletteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileAnchorEl);
  const id = open ? "theme-popover" : undefined;

  const navItems = [
    { label: "오밥뭐?", path: "/" },
    { label: "랜덤뽑기", path: "/game" },
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

           {/* Navigation Links (Desktop) */}
           <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
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

           {/* Navigation Menu (Mobile) */}
           <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
             <IconButton
               size="large"
               onClick={handleMobileMenuOpen}
               color="inherit"
               sx={{ color: theme.palette.text.primary }}
             >
               <MenuIcon />
             </IconButton>
             <Menu
               anchorEl={mobileAnchorEl}
               open={isMobileMenuOpen}
               onClose={handleMobileMenuClose}
               sx={{ display: { xs: 'block', md: 'none' } }}
             >
               {navItems.map((item) => (
                 <MenuItem 
                   key={item.path} 
                   onClick={handleMobileMenuClose}
                   component={Link}
                   href={item.path}
                 >
                   <Typography 
                     textAlign="center"
                     sx={{ 
                       fontWeight: pathname === item.path ? "bold" : "normal",
                       color: pathname === item.path ? theme.palette.secondary.main : theme.palette.text.primary 
                     }}
                   >
                     {item.label}
                   </Typography>
                 </MenuItem>
               ))}
             </Menu>
           </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="문의하기" placement="bottom">
            <IconButton
              color="inherit"
              onClick={() => window.open("https://forms.gle/Hq8LCa7foUcZig8f7", "_blank", "noopener,noreferrer")}
              sx={{ color: theme.palette.text.primary }}
            >
              <QuestionAnswerIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="테마 변경" placement="bottom">
            <IconButton
              color="inherit"
              aria-describedby={id}
              onClick={handlePaletteClick}
              sx={{ color: theme.palette.text.primary }}
            >
              <PaletteIcon />
            </IconButton>
          </Tooltip>
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
            slotProps={{
              root: {
                style: {
                  position: "absolute",
                },
              },
            }}
            PaperProps={{
              sx: {
                position: "absolute",
                backgroundColor: "transparent",
                boxShadow: "none",
                overflow: "visible",
              },
            }}
          >
            <Stack 
              direction="column" 
              sx={{ 
                p: 1, 
                position: "relative",
                height: Object.keys(themeOptions).length * 40,
                width: 48,
              }}
            >
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
                        sx={{ 
                          position: "absolute",
                          top: index * 40,
                          left: 4,
                          width: 40,
                          height: 40,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: currentTheme === key ? 28 : 24,
                            height: currentTheme === key ? 28 : 24,
                            minWidth: currentTheme === key ? 28 : 24,
                            minHeight: currentTheme === key ? 28 : 24,
                            borderRadius: "50%",
                            background: `linear-gradient(90deg, ${background} 50%, ${secondary} 50%)`,
                            border: `2px solid ${background}`,
                            boxShadow: 3,
                            transition: "all 0.2s ease-in-out",
                            flexShrink: 0,
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
