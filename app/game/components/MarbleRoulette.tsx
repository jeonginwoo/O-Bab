"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Box, Button, TextField, Typography, Paper, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, IconButton, Tooltip, useTheme, Divider, InputAdornment } from "@mui/material";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import { Roulette } from "../lib/marble-roulette/roulette";
import { stages } from "../lib/marble-roulette/data/maps";
import { Translations } from "../lib/marble-roulette/data/languages";
import styles from "./MarbleRoulette.module.scss";
import { ColorTheme } from "../lib/marble-roulette/types/ColorTheme";
import { themeMarblePalettes } from "../../theme/theme";
import { useThemeContext } from "../../theme/ThemeContext";
import ParticipantList, { Participant } from "./ParticipantList";
import CelebrationEmojis from "./CelebrationEmojis";
import { useSharedParticipants } from "../hooks/useSharedParticipants";

export default function MarbleRoulette() {
  const theme = useTheme();
  const { currentTheme } = useThemeContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const rouletteRef = useRef<Roulette | null>(null);
  const {
    participants,
    handleAdd,
  } = useSharedParticipants();
  const [newName, setNewName] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<number>(0);

  const buildNameList = useCallback((parts: Participant[]) => {
    return parts.flatMap(p => {
      return p.multiplier > 1 ? [`${p.name}*${p.multiplier}`] : [p.name];
    });
  }, []);

  const gameTheme: ColorTheme = useMemo(() => {
    const isDark = theme.palette.mode === 'dark';
    const mainColor = isDark ? theme.palette.secondary.main : theme.palette.primary.main;
    const bgColor = theme.palette.background.default;
    const paperColor = theme.palette.background.paper;
    const textColor = theme.palette.text.primary;
    
    return {
      background: bgColor,
      marbleLightness: isDark ? 60 : 50,
      marbleWinningBorder: mainColor,
      skillColor: mainColor,
      coolTimeIndicator: theme.palette.text.secondary,
      entity: {
        box: {
          fill: paperColor,
          outline: mainColor,
          bloom: mainColor,
          bloomRadius: 10,
        },
        circle: {
          fill: paperColor,
          outline: mainColor,
          bloom: mainColor,
          bloomRadius: 10,
        },
        polyline: {
          fill: 'transparent',
          outline: textColor,
          bloom: 'transparent',
          bloomRadius: 0,
        },
      },
      rankStroke: 'black',
      rankBackground: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
      minimapBackground: paperColor, // Ideally with opacity, but hex is fine or we can assume it's opaque
      minimapViewport: mainColor,
      winnerText: textColor,
      winnerOutline: 'transparent',
      winnerBackground: 'transparent', 
      marbleGlow: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)',
      marblePalette: themeMarblePalettes[currentTheme] || themeMarblePalettes['dark'],
    };
  }, [theme, currentTheme]);

  useEffect(() => {
    if (containerRef.current && !rouletteRef.current) {
      const r = new Roulette(containerRef.current);
      rouletteRef.current = r;

      const handleReady = () => {
        setIsReady(true);
        r.setCustomTheme(gameTheme);
      };

      const handleError = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        setErrorMSG("초기화 오류: " + (detail?.message || "알 수 없는 오류"));
      };

      const handleGoal = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail && detail.winner) {
          setWinner(detail.winner);
        }
      };

      r.addEventListener('ready', handleReady);
      r.addEventListener('error', handleError);
      r.addEventListener('goal', handleGoal);

      // Check if already ready (race condition)
      if (r.isReady) {
        setIsReady(true);
      }
    }

    return () => {
      if (rouletteRef.current) {
        rouletteRef.current.destroy();
        rouletteRef.current = null;
      }
    };
  }, []);

  // Sync Timer Theme with Game
  useEffect(() => {
    if (rouletteRef.current && isReady) {
      rouletteRef.current.setCustomTheme(gameTheme);
    }
  }, [gameTheme, isReady]);

  // Update marbles when participants or globalMultiplier change
  useEffect(() => {
    if (!isReady || !rouletteRef.current) return;

    const timer = setTimeout(() => {
      const nameList = buildNameList(participants);
      if (nameList.length > 0) {
        rouletteRef.current?.setMarbles(nameList);
      } else {
        rouletteRef.current?.clearMarbles();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [participants, isReady, buildNameList]);

  const handleStart = () => {
    if (rouletteRef.current && isReady) {
      setWinner(null);
      const nameList = buildNameList(participants);
      if (nameList.length > 0) {
        rouletteRef.current.start();
      }
    }
  };

  const handleClear = () => {
    if (rouletteRef.current && isReady) {
      const nameList = buildNameList(participants);
      if (nameList.length > 0) {
        rouletteRef.current.setMarbles(nameList);
      } else {
        rouletteRef.current.clearMarbles();
      }
      setWinner(null);
    }
  };

  const handleAddParticipant = () => {
    handleAdd(newName);
    setNewName('');
  };

  const handleMapChange = (event: SelectChangeEvent<number>) => {
    const newIndex = Number(event.target.value);
    setSelectedMap(newIndex);
    if (rouletteRef.current && isReady) {
      rouletteRef.current.setMap(newIndex);

      const nameList = buildNameList(participants);
      if (nameList.length > 0) {
        rouletteRef.current.setMarbles(nameList);
      }

      setWinner(null);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <div className={styles.controls}>
        <div className={styles.leftPanel}>
          <div ref={containerRef} className={styles.gameContainer}></div>
        </div>
        {winner && (
          <Typography
            variant="h5"
            component="p"
            color="secondary"
            align="center"
            sx={{ mt: 2, fontWeight: "bold", width: "100%" }}
          >
            🎉 당첨: {winner} 🎉
          </Typography>
        )}
        <div className={styles.rightPanel}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" component="h2" fontWeight="bold">
                게임 설정
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="시작">
                  <IconButton
                    onClick={handleStart}
                    disabled={!isReady}
                    color="success"
                    size="small"
                    sx={{
                      backgroundColor: 'success.main',
                      color: 'success.contrastText',
                      '&:hover': { backgroundColor: 'success.dark' },
                      '&.Mui-disabled': { backgroundColor: 'action.disabledBackground' },
                    }}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="초기화">
                  <IconButton
                    onClick={handleClear}
                    disabled={!isReady}
                    color="secondary"
                    size="small"
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Map select + Add participant inline */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="map-select-label">맵 선택</InputLabel>
                <Select
                  labelId="map-select-label"
                  value={selectedMap}
                  label="맵 선택"
                  onChange={handleMapChange}
                  disabled={!isReady}
                >
                  {stages.map((stage, index) => (
                    <MenuItem key={index} value={index}>
                      {(Translations.ko as Record<string, string>)[stage.title] || stage.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ flex: 1, minWidth: 160, maxWidth: 320 }}>
                <TextField
                  size="small"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddParticipant(); }}
                  placeholder="참가자 이름 입력"
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleAddParticipant}
                          disabled={!newName.trim()}
                          edge="end"
                          color="primary"
                          size="small"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Participant list */}
            <ParticipantList
              variant="plain"
              showInput={false}
              totalLabel="개 마블"
            />

            {errorMSG && (
              <Typography color="error" variant="body2">{errorMSG}</Typography>
            )}
          </Paper>
        </div>
      </div>
      <CelebrationEmojis show={!!winner} />
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
        Reference: <a href="https://lazygyu.github.io/roulette/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Marble Roulette by LazyGyu</a>
      </Typography>
    </Box>
  );
}
