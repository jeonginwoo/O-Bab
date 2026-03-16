"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Box,
  Slider,
  Typography,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ParticipantList from "./ParticipantList";
import CelebrationEmojis from "./CelebrationEmojis";
import { useSharedParticipants } from "../hooks/useSharedParticipants";

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
  const { participants } = useSharedParticipants();
  const [winningPlayerName, setWinningPlayerName] = useState<string | null>(null);
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
      if (names[i] !== "커피") ctx.fillText(names[i] || "", x, 20);
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

  // Auto-generate ladder whenever participants (or their multipliers) change
  useEffect(() => {
    const expandedPlayers = participants.flatMap((p) =>
      Array(p.multiplier).fill(p.name)
    );
    if (expandedPlayers.length < 2) {
      setPlayers([]);
      setResults([]);
      setNames([]);
      setLadderData([]);
      setWinningPlayerName(null);
      setGameState("initial");
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    setWinningPlayerName(null);
    setPlayers(expandedPlayers);
    randomizeAndDraw(expandedPlayers);
    setGameState("started");
  }, [participants, randomizeAndDraw]);

  const handleRetry = () => {
    randomizeAndDraw(players);
    setGameState("started");
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
          currentCtx.strokeStyle = "#FF0000";
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
    [setWinningPlayerName]
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
      {players.length < 2 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <style>
                {`
                  @keyframes steam {
                    0% { transform: translateY(0) scaleX(1); opacity: 0; }
                    10% { opacity: 0.5; }
                    50% { transform: translateY(-60px) scaleX(1.1); opacity: 0.3; }
                    100% { transform: translateY(-120px) scaleX(1.3); opacity: 0; }
                  }
                  .steam-path {
                    opacity: 0; /* 처음에는 보이지 않게 설정 */
                    animation: steam 4s infinite ease-in-out;
                    stroke: #a0a0a0;
                    stroke-width: 4;
                    stroke-linecap: round;
                    fill: none;
                  }
                  /* 각 연기마다 지연 시간을 주어 순차적으로 나타나게 함 */
                  .steam-1 { animation-delay: 0s; }
                  .steam-2 { animation-delay: 1.3s; }
                  .steam-3 { animation-delay: 2.6s; }
                `}
              </style>
              <g stroke="#6F4E37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M315 160 C365 160, 370 225, 295 230 L 300 215 C 355 215, 350 175, 315 175 Z" fill="#ffffff" />
                <path d="M80 140 Q80 280 200 280 Q320 280 320 140" fill="#ffffff" />
                <ellipse cx="200" cy="140" rx="120" ry="40" fill="#ffffff" />
                <ellipse
                  cx="200"
                  cy="140"
                  rx="110"
                  ry="35"
                  fill="#5d3a1a"
                  fillOpacity="0.9"
                  stroke="none"
                />
                <path
                  d="M130 125 A95 30 0 0 1 270 125"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeOpacity="0.15"
                />
                <path
                  d="M160 145 A45 15 0 0 0 240 145"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeOpacity="0.12"
                />
                <path
                  d="M185 138 A15 6 0 0 1 215 138"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeOpacity="0.1"
                />
              </g>
              <g className="steam-container">
                <path className="steam-path steam-1" d="M160 130 C150 110, 170 90, 160 70" />
                <path className="steam-path steam-2" d="M200 135 C190 115, 210 95, 200 75" />
                <path className="steam-path steam-3" d="M240 130 C230 110, 250 90, 240 70" />
              </g>
            </svg>
          </Box>
      )}
      {players.length >= 2 && (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 2 }}>
          <Tooltip title="시작" placement="top">
            <IconButton
              onClick={handleTrace}
              disabled={gameState === "finished" || gameState === "tracing"}
              color="primary"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": { backgroundColor: theme.palette.primary.dark },
              }}
            >
              <PlayArrowIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="초기화" placement="top">
            <IconButton
              onClick={handleRetry}
              disabled={gameState === "tracing"}
              color="primary"
              sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(8px)' }}
            >
              <RestartAltIcon />
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
            color="primary"
            sx={{ width: "100%", mx: "auto" }}
          />
        </Box>
      )}

      {players.length >= 2 && (
        <Box sx={{ position: "relative", mt: 2 }}>
          <canvas
            ref={canvasRef}
            style={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius,
              width: "100%",
              display: "block",
            }}
          ></canvas>
          {names.indexOf("커피") !== -1 && (
            <Box
              sx={{
                position: "absolute",
                top: 2,
                left: `${((names.indexOf("커피") + 1) / (players.length + 1)) * 100}%`,
                transform: "translateX(-50%)",
                pointerEvents: "none",
                width: 36,
                height: 36,
              }}
            >
              <svg viewBox="0 0 400 400" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <style>{`
                  @keyframes steam-mini {
                    0% { transform: translateY(0) scaleX(1); opacity: 0; }
                    10% { opacity: 0.5; }
                    50% { transform: translateY(-60px) scaleX(1.1); opacity: 0.3; }
                    100% { transform: translateY(-120px) scaleX(1.3); opacity: 0; }
                  }
                  .sm1 { opacity:0; animation: steam-mini 4s infinite ease-in-out 0s; stroke:#a0a0a0; stroke-width:4; stroke-linecap:round; fill:none; }
                  .sm2 { opacity:0; animation: steam-mini 4s infinite ease-in-out 1.3s; stroke:#a0a0a0; stroke-width:4; stroke-linecap:round; fill:none; }
                  .sm3 { opacity:0; animation: steam-mini 4s infinite ease-in-out 2.6s; stroke:#a0a0a0; stroke-width:4; stroke-linecap:round; fill:none; }
                `}</style>
                <g stroke="#6F4E37" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M315 160 C365 160, 370 225, 295 230 L300 215 C355 215, 350 175, 315 175 Z" fill="#ffffff" />
                  <path d="M80 140 Q80 280 200 280 Q320 280 320 140" fill="#ffffff" />
                  <ellipse cx="200" cy="140" rx="120" ry="40" fill="#ffffff" />
                  <ellipse cx="200" cy="140" rx="110" ry="35" fill="#6F4E37" stroke="none" />
                </g>
                <path className="sm1" d="M160 130 C150 110, 170 90, 160 70" />
                <path className="sm2" d="M200 135 C190 115, 210 95, 200 75" />
                <path className="sm3" d="M240 130 C230 110, 250 90, 240 70" />
              </svg>
            </Box>
          )}
        </Box>
      )}

      {players.length >= 2 && (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 2 }}>
          <Tooltip title="시작" placement="top">
            <IconButton
              onClick={handleTrace}
              disabled={gameState === "finished" || gameState === "tracing"}
              color="primary"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": { backgroundColor: theme.palette.primary.dark },
              }}
            >
              <PlayArrowIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="초기화" placement="top">
            <IconButton
              onClick={handleRetry}
              disabled={gameState === "tracing"}
              color="primary"
              sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(8px)' }}
            >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <CelebrationEmojis show={gameState === "finished" && !!winningPlayerName} />
      {gameState === "finished" && winningPlayerName && (
        <Typography
          variant="h5"
          component="p"
          color="primary"
          align="center"
          sx={{ mt: 2, fontWeight: "bold" }}
        >
          🎉 당첨: {winningPlayerName} 🎉
        </Typography>
      )}

      {/* Participant Card - always visible */}
      <ParticipantList sx={{ mt: 2 }} />
    </Box>
  );
};

export default Ladder;
