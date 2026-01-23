"use client";

import { useState } from "react";
import Roulette from "../roulette/Roulette";
import RandomFood from "../food/RandomFood";
import { Box, Typography, Tabs, Tab } from "@mui/material";

const HomeGameTabs = () => {
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
          <Tab label="음식 추천" />
        </Tabs>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {activeGame === 0 && <Roulette />}
        {activeGame === 1 && <RandomFood />}
      </Box>
    </Box>
  );
};

export default HomeGameTabs;
