"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  Slider,
  Typography,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplayIcon from "@mui/icons-material/Replay";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface Rung {
  y: number;
  x1: number;
  x2: number;
}

interface PathPoint {
  x: number;
  y: number;
}

const Ladder = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [ladderData, setLadderData] = useState<Rung[][]>([]);
  const [ladderHeight, setLadderHeight] = useState(400);
  const [gameState, setGameState] = useState<
    "initial" | "started" | "tracing" | "finished"
  >("initial");
  const [playerInput, setPlayerInput] = useState("");
  const [winningPlayerName, setWinningPlayerName] = useState<string | null>(
    null
  );
  const theme = useTheme();

  const drawLadder = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || players.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const num = players.length;
    const actualCanvasWidth = canvas.offsetWidth;
    const height = ladderHeight;
    canvas.width = actualCanvasWidth;
    canvas.height = height;

    const step = actualCanvasWidth / (num + 1);
    const minRungGap = 30;
    const rungCount = Math.floor((height - 70) / 50);
    const segmentHeight = (height - 70) / rungCount;
    const newLadderData: Rung[][] = [];

    ctx.clearRect(0, 0, actualCanvasWidth, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.palette.text.primary;
    ctx.fillStyle = theme.palette.text.primary;
    ctx.font = "14px Roboto";
    ctx.textAlign = "center";

    for (let i = 0; i < num; i++) {
      const x = step * (i + 1);
      ctx.fillText(names[i] || "", x, 20);
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x, height - 30);
      ctx.stroke();
      ctx.fillText(results[i] || "", x, height - 10);
    }

    for (let i = 0; i < num - 1; i++) {
      const rungs: Rung[] = [];
      for (let j = 0; j < rungCount; j++) {
        const x1 = step * (i + 1);
        const x2 = step * (i + 2);
        let y: number = 0;
        let attempts = 0;
        do {
          y =
            40 +
            segmentHeight * j +
            Math.random() * segmentHeight * 0.8 +
            segmentHeight * 0.1;
          attempts++;
        } while (
          (rungs.some((r) => Math.abs(r.y - y) < minRungGap) ||
            (i > 0 &&
              newLadderData[i - 1] &&
              newLadderData[i - 1].some(
                (r) => Math.abs(r.y - y) < minRungGap
              ))) &&
          attempts < 50
        );

        rungs.push({ y, x1, x2 });
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      }
      newLadderData.push(rungs.sort((a, b) => a.y - b.y));
    }
    setLadderData(newLadderData);
  }, [players, names, results, ladderHeight, theme.palette.text.primary]);

  const randomizeAndDraw = useCallback((currentPlayers: string[]) => {
    const shuffledResults = [...currentPlayers].sort(() => Math.random() - 0.5);
    const newNames = new Array(currentPlayers.length).fill("");
    const coffeeIndex = Math.floor(Math.random() * currentPlayers.length);
    newNames[coffeeIndex] = "커피";

    setResults(shuffledResults);
    setNames(newNames);
  }, []);

  const handleStart = () => {
    const parsedPlayers = playerInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsedPlayers.length < 2) {
      alert("이름을 2명 이상 입력해주세요.");
      return;
    }
    setPlayers(parsedPlayers);
    randomizeAndDraw(parsedPlayers);
    setGameState("started");
  };

  const handleRetry = () => {
    randomizeAndDraw(players);
    setGameState("started");
  };

  const handleReset = () => {
    setPlayers([]);
    setResults([]);
    setNames([]);
    setGameState("initial");
    setWinningPlayerName(null);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  const animatePath = useCallback(
    (path: PathPoint[], winnerName: string) => {
      let i = 0;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      function drawSegment(currentCtx: CanvasRenderingContext2D) {
        if (i < path.length - 1) {
          currentCtx.save();
          currentCtx.beginPath();
          currentCtx.moveTo(path[i].x, path[i].y);
          currentCtx.lineTo(path[i + 1].x, path[i + 1].y);
          currentCtx.strokeStyle = theme.palette.secondary.main;
          currentCtx.lineWidth = 3;
          currentCtx.stroke();
          currentCtx.restore();
          i++;
          setTimeout(() => drawSegment(currentCtx), 50);
        } else {
          setGameState("finished");
          setWinningPlayerName(winnerName);
        }
      }
      drawSegment(ctx);
    },
    [theme.palette.secondary.main, setWinningPlayerName]
  );

  const handleTrace = useCallback(() => {
    setGameState("tracing");
    const coffeeIndex = names.indexOf("커피");
    if (coffeeIndex === -1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const path: PathPoint[] = [];
    const width = canvas.width;
    const height = ladderHeight;
    const step = width / (players.length + 1);
    let currentX = step * (coffeeIndex + 1);
    let currentY = 30;
    let currentLane = coffeeIndex;

    path.push({ x: currentX, y: currentY });

    while (currentY < height - 30) {
      let nextRung: (Rung & { direction: "left" | "right" }) | null = null;

      if (currentLane < players.length - 1 && ladderData[currentLane]) {
        for (const rung of ladderData[currentLane]) {
          if (rung.y > currentY) {
            nextRung = { ...rung, direction: "right" };
            break;
          }
        }
      }
      if (currentLane > 0 && ladderData[currentLane - 1]) {
        for (const rung of ladderData[currentLane - 1]) {
          if (rung.y > currentY) {
            if (!nextRung || rung.y < nextRung.y) {
              nextRung = { ...rung, direction: "left" };
            }
            break;
          }
        }
      }

      if (nextRung) {
        path.push({ x: currentX, y: nextRung.y });
        currentY = nextRung.y;
        if (nextRung.direction === "right") {
          currentX = nextRung.x2;
          currentLane++;
        } else {
          currentX = nextRung.x1;
          currentLane--;
        }
        path.push({ x: currentX, y: currentY });
      } else {
        currentY = height - 30;
        path.push({ x: currentX, y: currentY });
      }
    }

    animatePath(path, results[currentLane]);
  }, [
    names,
    players.length,
    ladderData,
    ladderHeight,
    animatePath,
    players,
    results,
  ]);

  useEffect(() => {
    if (gameState === "started") {
      drawLadder();
    }
  }, [gameState, drawLadder]);

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: "auto" }}>
      {gameState === "initial" && (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <TextField
            fullWidth
            label="이름 (쉼표로 구분)"
            variant="outlined"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleStart();
              }
            }}
            size="small"
            color="secondary"
            InputLabelProps={{
              sx: {
                color: theme.palette.text.secondary,
                "&.Mui-focused": {
                  color: theme.palette.secondary.main,
                },
              },
            }}
            sx={{
              "& .MuiInputBase-root": { color: theme.palette.text.primary },
            }}
          />
          <Button
            variant="contained"
            onClick={handleStart}
            sx={{
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.background.default,
              "&:hover": { backgroundColor: theme.palette.secondary.dark },
            }}
          >
            시작
          </Button>
        </Box>
      )}
      {gameState !== "initial" && (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 2 }}>
          <Tooltip title="재구성" placement="top">
            <IconButton
              onClick={handleRetry}
              disabled={gameState === "tracing"}
              color="secondary"
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.background.default,
                "&:hover": { backgroundColor: theme.palette.secondary.dark },
              }}
            >
              <ReplayIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="결과 확인" placement="top">
            <IconButton
              onClick={handleTrace}
              disabled={gameState === "finished" || gameState === "tracing"}
              color="success"
              sx={{
                backgroundColor: theme.palette.success.main,
                color: theme.palette.success.contrastText,
                "&:hover": { backgroundColor: theme.palette.success.dark },
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="초기화" placement="top">
            <IconButton
              onClick={handleReset}
              color="secondary"
              disabled={gameState === "tracing"}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.background.default,
                "&:hover": { backgroundColor: theme.palette.secondary.dark },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {players.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom color="text.primary">
            사다리 길이: {ladderHeight}
          </Typography>
          <Slider
            value={ladderHeight}
            onChange={(e, newValue) => setLadderHeight(newValue as number)}
            min={200}
            max={800}
            step={50}
            marks
            valueLabelDisplay="auto"
            color="secondary"
            sx={{ width: "100%", mx: "auto" }}
          />
        </Box>
      )}

      {gameState !== "initial" && (
        <canvas
          ref={canvasRef}
          style={{
            marginTop: theme.spacing(2),
            backgroundColor: theme.palette.background.paper,
            borderRadius: theme.shape.borderRadius,
            width: "100%",
            display: "block",
          }}
        ></canvas>
      )}

      {gameState === "finished" && winningPlayerName && (
        <Typography
          variant="h5"
          component="p"
          color="secondary"
          align="center"
          sx={{ mt: 2, fontWeight: "bold" }}
        >
          🎉 당첨: {winningPlayerName} 🎉
        </Typography>
      )}
    </Box>
  );
};

export default Ladder;
