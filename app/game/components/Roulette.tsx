"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import ParticipantList from "./ParticipantList";
import CelebrationEmojis from "./CelebrationEmojis";
import { useSharedParticipants } from "../hooks/useSharedParticipants";

const Roulette = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { participants, setParticipants } = useSharedParticipants();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningMenu, setWinningMenu] = useState<string | null>(null);
  const [spinPower, setSpinPower] = useState<number | null>(null);
  const [powerGauge, setPowerGauge] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const colors = useRef<string[]>([]);
  const angle = useRef(0);
  const currentSpeed = useRef(0);
  const rotateInterval = useRef<NodeJS.Timeout | null>(null);
  const stopRequested = useRef(false);
  const chargeInterval = useRef<NodeJS.Timeout | null>(null);
  const isChargingRef = useRef(false);
  const powerGaugeRef = useRef(0);
  const theme = useTheme();

  const generatePastelColor = () => {
    const r = Math.floor(Math.random() * 127 + 127);
    const g = Math.floor(Math.random() * 127 + 127);
    const b = Math.floor(Math.random() * 127 + 127);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [cw, ch] = [canvas.width / 2, canvas.height / 2];
    const totalWeight = participants.reduce((sum, item) => sum + item.multiplier, 0);
    let startAngle = 0;

    if (colors.current.length !== participants.length) {
      colors.current = participants.map(() => generatePastelColor());
    }

    // Reset transform to identity before clearing to ensure full canvas is cleared
    // (spin() applies a rotation transform, so clearRect would otherwise miss corners)
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw Wheel Background/Shadow
    const isDark = theme.palette.mode === "dark";
    ctx.shadowColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)";
    ctx.shadowBlur = isDark ? 20 : 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.beginPath();
    ctx.arc(cw, ch, cw - 10, 0, 2 * Math.PI);
    ctx.fillStyle = theme.palette.background.paper;
    ctx.fill();
    ctx.shadowColor = "transparent"; // Reset shadow

    // Draw Segments
    participants.forEach((item, i) => {
      const arc = (item.multiplier / totalWeight) * 2 * Math.PI;
      ctx.beginPath();
      ctx.fillStyle = colors.current[i];
      ctx.moveTo(cw, ch);
      ctx.arc(cw, ch, cw - 15, startAngle, startAngle + arc);
      ctx.closePath();
      ctx.fill();
      startAngle += arc;
    });

    // Draw divider lines (one per boundary, consistent thickness)
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.palette.background.paper;
    let dividerAngle = 0;
    participants.forEach((item) => {
      ctx.beginPath();
      ctx.moveTo(cw, ch);
      ctx.lineTo(
        cw + Math.cos(dividerAngle) * (cw - 15),
        ch + Math.sin(dividerAngle) * (cw - 15)
      );
      ctx.stroke();
      dividerAngle += (item.multiplier / totalWeight) * 2 * Math.PI;
    });

    // Draw Text
    ctx.fillStyle = "#FFFFFF"; // Fixed white text for better contrast on colored segments
    ctx.font = "bold 16px Roboto"; // Bold text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    startAngle = 0;

    participants.forEach((item) => {
      const itemAngle = startAngle + (item.multiplier / totalWeight) * Math.PI;
      ctx.save();
      ctx.translate(
        cw + Math.cos(itemAngle) * (cw - 60),
        ch + Math.sin(itemAngle) * (ch - 60)
      );
      ctx.rotate(itemAngle + Math.PI / 2);
      
      // Text Shadow for readability
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(item.name, 0, 0);
      ctx.restore();
      startAngle += (item.multiplier / totalWeight) * 2 * Math.PI;
    });

    // Draw Center Circle (Hub)
    ctx.shadowColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)";
    ctx.shadowBlur = isDark ? 12 : 5;
    ctx.beginPath();
    ctx.arc(cw, ch, 25, 0, 2 * Math.PI);
    ctx.fillStyle = theme.palette.background.paper;
    ctx.fill();
    
    // Center Dot
    ctx.beginPath();
    ctx.arc(cw, ch, 10, 0, 2 * Math.PI);
    ctx.fillStyle = theme.palette.primary.main;
    ctx.fill();
    ctx.shadowColor = "transparent"; // Reset for next frame
  };

  const spin = () => {
    if (stopRequested.current && currentSpeed.current > 0) {
      currentSpeed.current -= Math.random() * 0.1 + 0.05;
    }

    if (currentSpeed.current <= 0) {
      currentSpeed.current = 0;
      if (rotateInterval.current) clearInterval(rotateInterval.current);
      rotateInterval.current = null;
      stopRequested.current = false;
      setIsSpinning(false);

      const totalWeight = participants.reduce((sum, item) => sum + item.multiplier, 0);
      const finalAngle = angle.current % 360;
      const winningAngle = (270 - finalAngle + 360) % 360;
      const winningAngleRad = (winningAngle * Math.PI) / 180;

      let start = 0;
      for (let i = 0; i < participants.length; i++) {
        const arc = (participants[i].multiplier / totalWeight) * 2 * Math.PI;
        if (winningAngleRad >= start && winningAngleRad < start + arc) {
          setTimeout(() => {
            setWinningMenu(participants[i].name);
            setSpinPower(null);
          }, 100);
          break;
        }
        start += arc;
      }
      return;
    }

    angle.current += currentSpeed.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle.current * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    draw();
    ctx.restore();
  };

  const handleChargeEnd = useCallback(() => {
    if (!isChargingRef.current) return;

    isChargingRef.current = false;
    setIsCharging(false);
    if (chargeInterval.current) {
      clearInterval(chargeInterval.current);
      chargeInterval.current = null;
    }

    const gauge = powerGaugeRef.current;
    if (gauge < 10) {
      setPowerGauge(0);
      powerGaugeRef.current = 0;
      return;
    }

    const baseSpeed = 5 + (gauge / 100) * 20;
    const spinDuration = 1000 + (gauge / 100) * 2000;

    setWinningMenu(null);
    setSpinPower(gauge);
    setIsSpinning(true);
    currentSpeed.current = baseSpeed;
    angle.current = 0;
    stopRequested.current = false;
    rotateInterval.current = setInterval(spin, 10);

    setTimeout(() => {
      stopRequested.current = true;
    }, spinDuration);

    setTimeout(() => {
      setPowerGauge(0);
      powerGaugeRef.current = 0;
    }, 300);
  }, [spin]);

  useEffect(() => {
    window.addEventListener("mouseup", handleChargeEnd);
    return () => window.removeEventListener("mouseup", handleChargeEnd);
  }, [handleChargeEnd]);

  const handleShuffle = useCallback(() => {
    if (isSpinning) return;
    setParticipants((prev) => [...prev].sort(() => Math.random() - 0.5));
    colors.current = [];
    setWinningMenu(null);
  }, [isSpinning, setParticipants]);

  const handleSort = useCallback(() => {
    if (isSpinning) return;
    setParticipants((prev) => [...prev].sort((a, b) => a.name.localeCompare(b.name, "ko", { numeric: true })));
    colors.current = [];
    setWinningMenu(null);
  }, [isSpinning, setParticipants]);

  const handleChargeStart = () => {
    if (participants.length <= 1) {
      alert("참가자는 최소 2명 이상이어야 합니다.");
      return;
    }
    if (isSpinning) return;

    isChargingRef.current = true;
    setIsCharging(true);
    setPowerGauge(0);
    powerGaugeRef.current = 0;
    
    chargeInterval.current = setInterval(() => {
      setPowerGauge((prev) => {
        const next = prev >= 100 ? 100 : prev + 1;
        powerGaugeRef.current = next;
        return next;
      });
    }, 15);
  };


  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = canvas?.parentElement;
      if (canvas && container) {
        const size = container.offsetWidth;
        canvas.width = size;
        canvas.height = size;
        draw();
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [participants, theme]);

  useEffect(() => {
    draw();
  }, [participants, theme]);

  useEffect(() => {
    return () => {
      if (chargeInterval.current) {
        clearInterval(chargeInterval.current);
      }
      if (rotateInterval.current) {
        clearInterval(rotateInterval.current);
      }
    };
  }, []);

    return (
      <Box sx={{ p: 2, maxWidth: 600, mx: "auto" }}>
        <Box
          sx={{
            position: "relative", width: "100%", maxWidth: 300, mx: "auto" }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            margin: "auto",
            width: "100%",
            height: "auto",
          }}
        ></canvas>
        <Box
          sx={{
            position: "absolute",
            top: -2,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            filter: "drop-shadow(0px 3px 3px rgba(0,0,0,0.3))",
          }}
        >
          <div
             style={{
                  width: 0, 
                  height: 0, 
                  borderLeft: "15px solid transparent",
                  borderRight: "15px solid transparent",
                  borderTop: `30px solid ${theme.palette.primary.main}`,
             }}
          />
        </Box>
      </Box>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "center", alignItems: "center", mb: 4, position: "relative" }}>
        <Button
          variant="contained"
          size="large"
          onMouseDown={handleChargeStart}
          onTouchStart={handleChargeStart}
          onTouchEnd={handleChargeEnd}
          disabled={isSpinning}
          sx={{
            borderRadius: 50,
            width: 240,
            py: 1.5,
            fontSize: "1.2rem",
            fontWeight: "bold",
            boxShadow: 4,
            background: isSpinning
              ? theme.palette.action.disabledBackground
              : isCharging && powerGauge < 10
              ? `linear-gradient(to right, ${theme.palette.error.dark} ${powerGauge}%, ${theme.palette.error.main} ${powerGauge}%)`
              : `linear-gradient(to right, ${theme.palette.primary.dark} ${powerGauge}%, ${theme.palette.primary.main} ${powerGauge}%)`,
            color: theme.palette.background.default,
            transition: "transform 0.2s",
            "&:hover": {
              background: isSpinning
                ? theme.palette.action.disabledBackground
                : isCharging && powerGauge < 10
                ? `linear-gradient(to right, ${theme.palette.error.dark} ${powerGauge}%, ${theme.palette.error.main} ${powerGauge}%)`
                : `linear-gradient(to right, ${theme.palette.primary.dark} ${powerGauge}%, ${theme.palette.primary.main} ${powerGauge}%)`,
              transform: isSpinning ? "none" : "scale(1.05)",
            },
            "&:disabled": {
              backgroundColor: theme.palette.action.disabledBackground,
              color: theme.palette.text.disabled,
            },
            "&:active": {
              transform: "scale(0.98)",
            },
          }}
        >
          {isCharging ? `${powerGauge}%` : spinPower !== null ? `${Math.round(spinPower)}%` : "꾹 눌러서 돌리기"}
        </Button>
        <Box sx={{ position: "absolute", right: 0, display: "flex", flexDirection: "column", gap: 1 }}>
          <Tooltip title="가나다순 정렬" placement="left">
            <span>
              <IconButton
                onClick={handleSort}
                disabled={isSpinning}
                color="primary"
                sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(8px)' }}
              >
                <SortByAlphaIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="순서 섞기" placement="left">
            <span>
              <IconButton
                onClick={handleShuffle}
                disabled={isSpinning}
                color="primary"
                sx={{ border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(8px)' }}
              >
                <ShuffleIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <CelebrationEmojis show={!!winningMenu} />
      {winningMenu && (
        <Typography
          variant="h5"
          component="p"
          color="primary"
          align="center"
          sx={{ mt: 2, mb: 2, fontWeight: "bold" }}
        >
          🎉 당첨: {winningMenu} 🎉
        </Typography>
      )}

      <ParticipantList totalLabel=" 비중" />
    </Box>
  );
};

export default Roulette;
