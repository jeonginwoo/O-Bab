"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Box, Button, TextField, Typography, Paper, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, IconButton, Tooltip, useTheme, Divider, InputAdornment } from "@mui/material";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { Roulette } from "../lib/marble-roulette/roulette";
import { stages } from "../lib/marble-roulette/data/maps";
import { Translations } from "../lib/marble-roulette/data/languages";
import styles from "./MarbleRoulette.module.scss";
import { ColorTheme } from "../lib/marble-roulette/types/ColorTheme";
import { themeMarblePalettes } from "../../theme/theme";
import { useThemeContext } from "../../theme/ThemeContext";

interface Participant {
  id: string;
  name: string;
  multiplier: number;
}

export default function MarbleRoulette() {
  const theme = useTheme();
  const { currentTheme } = useThemeContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const rouletteRef = useRef<Roulette | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: '돈토', multiplier: 3 },
    { id: '2', name: '윤스', multiplier: 2 },
    { id: '3', name: '맘터', multiplier: 1 },
    { id: '4', name: '국밥', multiplier: 4 },
  ]);
  const [newName, setNewName] = useState('');
  const [globalMultiplier, setGlobalMultiplier] = useState(1);
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
    const trimmed = newName.trim();
    if (!trimmed) return;
    setParticipants(prev => [
      ...prev,
      { id: Date.now().toString(), name: trimmed, multiplier: 1 },
    ]);
    setNewName('');
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleChangeMultiplier = (id: string, delta: number) => {
    setParticipants(prev =>
      prev.map(p =>
        p.id === id ? { ...p, multiplier: Math.max(1, p.multiplier + delta) } : p
      )
    );
  };

  const handleGlobalMultiplierChange = (delta: number) => {
    setGlobalMultiplier(prev => {
      const next = Math.min(1000, Math.max(1, prev + delta));
      setParticipants(parts => parts.map(p => ({ ...p, multiplier: next })));
      return next;
    });
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
        <div className={styles.rightPanel}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" component="h2" fontWeight="bold">
                게임 설정
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleStart}
                  disabled={!isReady}
                  sx={{ fontWeight: 'bold' }}
                >
                  시작
                </Button>
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
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="medium">참가자 목록</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>전체 배수</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleGlobalMultiplierChange(-1)}
                    disabled={globalMultiplier <= 1}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <TextField
                    size="small"
                    value={globalMultiplier}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1) {
                        const clamped = Math.min(1000, val);
                        setGlobalMultiplier(clamped);
                        setParticipants(parts => parts.map(p => ({ ...p, multiplier: clamped })));
                      } else if (e.target.value === '') {
                        setGlobalMultiplier(1);
                      }
                    }}
                    inputProps={{ min: 1, max: 1000, style: { textAlign: 'center', padding: '2px 4px', width: 32 } }}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', fontWeight: 'bold' } }}
                  />
                  <IconButton size="small" onClick={() => handleGlobalMultiplierChange(1)} disabled={globalMultiplier >= 1000}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    총 {participants.reduce((sum, p) => sum + p.multiplier, 0)}개 마블
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  alignContent: 'flex-start',
                  minHeight: 120,
                }}
              >
                {participants.length === 0 && (
                  <Typography variant="body2" color="text.disabled" sx={{ m: 'auto' }}>
                    참가자를 추가해주세요
                  </Typography>
                )}
                {participants.map(p => (
                  <Box
                    key={p.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'secondary.main',
                      borderRadius: 2,
                      px: 1,
                      py: 0.5,
                      bgcolor: 'secondary.main',
                      color: 'background.paper',
                      minWidth: 70,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium" noWrap sx={{ flex: 1, textAlign: 'center', color: 'background.paper' }}>
                        {p.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveParticipant(p.id)}
                        sx={{ p: 0.25, color: 'background.paper' }}
                      >
                        <CloseIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleChangeMultiplier(p.id, -1)}
                        disabled={p.multiplier <= 1}
                        sx={{ p: 0.25, color: 'background.paper', '&.Mui-disabled': { color: 'background.paper', opacity: 0.4} }}
                      >
                        <RemoveIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                      <Typography variant="caption" sx={{ minWidth: 24, textAlign: 'center', color: 'background.paper' }}>
                        {p.multiplier}x
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleChangeMultiplier(p.id, 1)}
                        sx={{ p: 0.25, color: 'background.paper' }}
                      >
                        <AddIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {errorMSG && (
              <Typography color="error" variant="body2">{errorMSG}</Typography>
            )}

            {winner && (
              <Typography
                variant="h5"
                component="p"
                color="secondary"
                align="center"
                sx={{ mt: 2, fontWeight: "bold" }}
              >
                🎉 당첨: {winner} 🎉
              </Typography>
            )}
          </Paper>
        </div>
      </div>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
        Reference: <a href="https://lazygyu.github.io/roulette/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Marble Roulette by LazyGyu</a>
      </Typography>
    </Box>
  );
}
