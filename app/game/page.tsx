"use client";

import React, { useState } from "react";
import { Container, Card, CardContent, Box, Tabs, Tab, useMediaQuery, useTheme, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";
import Ladder from "./components/Ladder";
import Roulette from "./components/Roulette";
import RandomFood from "./components/RandomFood";
import MarbleRoulette from "./components/MarbleRoulette";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  noPadding?: boolean;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, noPadding, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`game-tabpanel-${index}`}
      aria-labelledby={`game-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: noPadding ? 0 : 3 }}>{children}</Box>}
    </div>
  );
}

export default function GamePage() {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleSelectChange = (event: SelectChangeEvent<number>) => {
    setValue(Number(event.target.value));
  };

  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          {isMobile ? (
            <Box sx={{ p: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="game-select-label">게임 선택</InputLabel>
                <Select
                  labelId="game-select-label"
                  value={value}
                  label="게임 선택"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={0}>룰렛</MenuItem>
                  <MenuItem value={1}>사다리타기</MenuItem>
                  <MenuItem value={2}>음식추천</MenuItem>
                  <MenuItem value={3}>마블 룰렛</MenuItem>
                </Select>
              </FormControl>
            </Box>
          ) : (
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
              <Tab label="마블 룰렛" id="game-tab-3" aria-controls="game-tabpanel-3" />
            </Tabs>
          )}
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
          <TabPanel value={value} index={3} noPadding>
            <MarbleRoulette />
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
}
