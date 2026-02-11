"use client";

import React, { useState } from "react";
import { Container, Card, CardContent, Box, Tabs, Tab } from "@mui/material";
import Ladder from "./components/Ladder";
import Roulette from "./components/Roulette";
import RandomFood from "./components/RandomFood";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`game-tabpanel-${index}`}
      aria-labelledby={`game-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function GamePage() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="게임 선택"
            centered
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label="룰렛" id="game-tab-0" aria-controls="game-tabpanel-0" />
            <Tab label="사다리타기" id="game-tab-1" aria-controls="game-tabpanel-1" />
            <Tab label="음식추천" id="game-tab-2" aria-controls="game-tabpanel-2" />
          </Tabs>
        </Box>
        <CardContent>
          <TabPanel value={value} index={0}>
            <Roulette />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Ladder />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <RandomFood />
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
}
