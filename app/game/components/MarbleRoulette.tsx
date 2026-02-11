"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Button, TextField, Typography, Paper, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, IconButton, Tooltip } from "@mui/material";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Roulette } from "../lib/marble-roulette/roulette";
import { stages } from "../lib/marble-roulette/data/maps";
import styles from "./MarbleRoulette.module.scss";

export default function MarbleRoulette() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rouletteRef = useRef<Roulette | null>(null);
  const [names, setNames] = useState<string>("돈토*3, 윤스*2, 맘터, 국밥*4");
  const [isReady, setIsReady] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<number>(0);

  useEffect(() => {
    if (containerRef.current && !rouletteRef.current) {
      const r = new Roulette(containerRef.current);
      rouletteRef.current = r;

      const handleReady = () => {
        setIsReady(true);
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

  // Update marbles when names change
  useEffect(() => {
    if (!isReady || !rouletteRef.current) return;

    const timer = setTimeout(() => {
      const nameList = names.split(/[\n,]+/).map(s => s.trim()).filter(s => s);
      if (nameList.length > 0) {
        rouletteRef.current?.setMarbles(nameList);
      } else {
        rouletteRef.current?.clearMarbles();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [names, isReady]);

  const handleStart = () => {
    if (rouletteRef.current && isReady) {
      setWinner(null);
      // Marbles are already set by the effect, but we check if we have any to start
      const nameList = names.split(/[\n,]+/).map(s => s.trim()).filter(s => s);
      if (nameList.length > 0) {
        rouletteRef.current.start();
      }
    }
  };

  const handleClear = () => {
    if (rouletteRef.current && isReady) {
      const nameList = names.split(/[\n,]+/).map(s => s.trim()).filter(s => s);
      if (nameList.length > 0) {
        rouletteRef.current.setMarbles(nameList);
      } else {
        rouletteRef.current.clearMarbles();
      }
      setWinner(null);
    }
  };

  const handleMapChange = (event: SelectChangeEvent<number>) => {
    const newIndex = Number(event.target.value);
    setSelectedMap(newIndex);
    if (rouletteRef.current && isReady) {
      rouletteRef.current.setMap(newIndex);

      // Restore marbles for the new map
      const nameList = names.split(/[\n,]+/).map(s => s.trim()).filter(s => s);
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

            <FormControl fullWidth variant="outlined" size="small">
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
                    {stage.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">참가자 목록</Typography>
              <TextField
                multiline
                rows={6}
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder="이름을 입력하세요 (ex. 짱구*5, 짱아*10, 봉미선*3)"
                fullWidth
                variant="outlined"
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': {
                    height: '100%',
                    alignItems: 'flex-start'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary">
                * 총 {names.split(/[\n,]+/).filter(s => s.trim()).length}명이 참가 중입니다.
              </Typography>
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
