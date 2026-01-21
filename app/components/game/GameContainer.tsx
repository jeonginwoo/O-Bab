"use client";

import { useState } from "react";
import Roulette from "./Roulette";
import Ladder from "./Ladder";
import RandomFood from "./RandomFood";
import RestaurantMap from "./RestaurantMap";
import { Box, Typography, Tabs, Tab } from "@mui/material";

const GameContainer = () => {
  const [activeGame, setActiveGame] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveGame(newValue);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={activeGame}
          onChange={handleChange}
          variant="fullWidth"
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label="룰렛" />
          <Tab label="사다리타기" />
          <Tab label="음식 추천" />
          <Tab label="맛집" />
        </Tabs>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {activeGame === 0 && <Roulette />}
        {activeGame === 1 && <Ladder />}
        {activeGame === 2 && <RandomFood />}
        {activeGame === 3 && <RestaurantMap />}
      </Box>
    </Box>
  );
};

export default GameContainer;
