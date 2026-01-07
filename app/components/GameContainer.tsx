"use client";

import { useState } from "react";
import Roulette from "./Roulette";
import Ladder from "./Ladder";
import { Box, Typography, Tabs, Tab } from "@mui/material";

const GameContainer = () => {
  const [activeGame, setActiveGame] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveGame(newValue);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography
        variant="h5"
        component="h2"
        color="secondary"
        align="center"
        gutterBottom
      >
        게임
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={activeGame}
          onChange={handleChange}
          centered
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label="룰렛" />
          <Tab label="사다리타기" />
        </Tabs>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {activeGame === 0 && <Roulette />}
        {activeGame === 1 && <Ladder />}
      </Box>
    </Box>
  );
};

export default GameContainer;
