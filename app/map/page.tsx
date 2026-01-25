"use client";

import React from "react";
import RestaurantMap from "./components/RestaurantMap";
import { Container, Card, CardContent } from "@mui/material";

export default function MapPage() {
  return (
    <Container maxWidth={false} sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2, height: "100%" }}>
      <Card sx={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <CardContent sx={{ flexGrow: 1, p: 0, display: "flex", flexDirection: "column", height: "100%", "&:last-child": { pb: 0 } }}>
          <RestaurantMap />
        </CardContent>
      </Card>
    </Container>
  );
}
