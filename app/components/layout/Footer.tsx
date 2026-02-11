"use client";

import { AppBar, Toolbar, Typography, useTheme } from "@mui/material";

export default function Footer() {
  const theme = useTheme();
  return (
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
          밥밥밥 ver 3.7.0
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
