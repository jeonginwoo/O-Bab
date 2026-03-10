"use client";

import React, { useState } from "react";
import { Container, Card, CardContent, Box, Tabs, Tab, useMediaQuery, useTheme, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";
import Ladder from "./components/Ladder";
import Roulette from "./components/Roulette";
import RandomFood from "./components/RandomFood";
import MarbleRoulette from "./components/MarbleRoulette";
import { ParticipantsProvider } from "./hooks/useSharedParticipants";

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
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Card
        className="animate-fade-in-up"
        sx={{
          position: 'relative',
          border: (t) => `1px solid ${t.palette.secondary.main}22`,
          backgroundColor: (t) => `${t.palette.background.paper}e8`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.28s ease',
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
            transform: 'translateY(-4px)',
            borderColor: (t) => `${t.palette.secondary.main}55`,
          },
          '&:hover::after': { opacity: 1 },
        }}
      >
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
              <Tab label="마블 룰렛" id="game-tab-2" aria-controls="game-tabpanel-2" />
              <Tab label="음식추천" id="game-tab-3" aria-controls="game-tabpanel-3" />
            </Tabs>
          )}
        </Box>
        <CardContent>
          <ParticipantsProvider>
          <TabPanel value={value} index={0} noPadding>
            <Roulette />
          </TabPanel>
          <TabPanel value={value} index={1} noPadding>
            <Ladder />
          </TabPanel>
          <TabPanel value={value} index={2} noPadding>
            <MarbleRoulette />
          </TabPanel>
          <TabPanel value={value} index={3} noPadding>
            <RandomFood />
          </TabPanel>
          </ParticipantsProvider>
        </CardContent>
      </Card>
    </Container>
  );
}
