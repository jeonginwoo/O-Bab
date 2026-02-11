"use client";

import RandomFood from "../food/RandomFood";
import { Card, CardContent, Typography, Box } from "@mui/material";

const FoodRecommendation = () => {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <RandomFood />
        </Box>
      </CardContent>
    </Card>
  );
};

export default FoodRecommendation;
