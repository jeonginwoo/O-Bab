"use client";

import { Box, Toolbar, Typography, useTheme } from "@mui/material";
import RiceBowlIcon from "@mui/icons-material/RiceBowl";

export default function Footer() {
  const theme = useTheme();
  const sec = theme.palette.primary.main;

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        position: 'relative',
        backgroundColor: `${theme.palette.background.paper}e8`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderTop: `1px solid ${sec}25`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${sec}70, transparent)`,
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', gap: 1 }}>
        <RiceBowlIcon sx={{ fontSize: 16, color: sec, opacity: 0.7 }} />
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            letterSpacing: '0.08em',
            fontSize: '0.75rem',
          }}
        >
          밥밥밥 ver 3.8.5
        </Typography>
        <RiceBowlIcon sx={{ fontSize: 16, color: sec, opacity: 0.7 }} />
      </Toolbar>
    </Box>
  );
}
