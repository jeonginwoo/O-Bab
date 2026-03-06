"use client";

import React from "react";
import RestaurantMap from "./components/RestaurantMap";
import { Container, Card, CardContent } from "@mui/material";

export default function MapPage() {
  return (
    <Container maxWidth={false} sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2, height: "100%" }}>
      <Card
        className="animate-fade-in-up"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: 'relative',
          border: (t) => `1px solid ${t.palette.secondary.main}22`,
          backgroundColor: (t) => `${t.palette.background.paper}e8`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'border-color 0.28s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            boxShadow: (t) => `0 20px 48px ${t.palette.secondary.main}22, 0 4px 16px rgba(0,0,0,0.18)`,
            opacity: 0,
            transition: 'opacity 0.28s ease',
            pointerEvents: 'none',
          },
          '&:hover': {
            borderColor: (t) => `${t.palette.secondary.main}55`,
          },
          '&:hover::after': { opacity: 1 },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 0, display: "flex", flexDirection: "column", height: "100%", "&:last-child": { pb: 0 } }}>
          <RestaurantMap />
        </CardContent>
      </Card>
    </Container>
  );
}
