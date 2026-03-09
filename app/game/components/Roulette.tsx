"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Button,
  useTheme,
  Typography,
} from "@mui/material";
import ParticipantList, { Participant } from "./ParticipantList";

const Roulette = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: "돈토", multiplier: 5 },
    { id: '2', name: "윤스", multiplier: 5 },
  ]);
  const [newMenu, setNewMenu] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningMenu, setWinningMenu] = useState<string | null>(null);
  const [globalMultiplier, setGlobalMultiplier] = useState(5);
  const [powerGauge, setPowerGauge] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const colors = useRef<string[]>([]);
  const angle = useRef(0);
  const currentSpeed = useRef(0);
  const rotateInterval = useRef<NodeJS.Timeout | null>(null);
  const stopRequested = useRef(false);
  const chargeInterval = useRef<NodeJS.Timeout | null>(null);
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Wheel Background/Shadow
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;

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
      ctx.arc(cw, ch, cw - 15, startAngle, startAngle + arc); // Slightly smaller radius
      ctx.fill();
      ctx.stroke(); // Add subtle stroke between segments
      ctx.closePath();
      startAngle += arc;
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
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(cw, ch, 25, 0, 2 * Math.PI);
    ctx.fillStyle = theme.palette.background.paper;
    ctx.fill();
    
    // Center Dot
    ctx.beginPath();
    ctx.arc(cw, ch, 10, 0, 2 * Math.PI);
    ctx.fillStyle = theme.palette.secondary.main;
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
          setTimeout(
            () => setWinningMenu(participants[i].name),
            100
          );
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

  const handleChargeStart = () => {
    if (participants.length <= 1) {
      alert("메뉴는 최소 2개 이상이어야 합니다.");
      return;
    }
    if (isSpinning) return;

    setIsCharging(true);
    setPowerGauge(0);
    
    chargeInterval.current = setInterval(() => {
      setPowerGauge((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 1;
      });
    }, 15);
  };

  const handleChargeEnd = () => {
    if (!isCharging) return;
    
    setIsCharging(false);
    if (chargeInterval.current) {
      clearInterval(chargeInterval.current);
      chargeInterval.current = null;
    }

    if (powerGauge < 10) {
      setPowerGauge(0);
      return;
    }

    // 게이지에 따라 속도 계산 (10-100 범위를 5-25 속도로 매핑)
    const baseSpeed = 5 + (powerGauge / 100) * 20;
    const spinDuration = 1000 + (powerGauge / 100) * 2000;

    setWinningMenu(null);
    setIsSpinning(true);
    currentSpeed.current = baseSpeed;
    angle.current = 0;
    stopRequested.current = false;
    rotateInterval.current = setInterval(spin, 10);

    setTimeout(() => {
      stopRequested.current = true;
    }, spinDuration);

    // 게이지 초기화
    setTimeout(() => {
      setPowerGauge(0);
    }, 300);
  };

  const handleAdd = () => {
    if (!newMenu.trim()) {
      alert("이름을 입력한 후 버튼을 클릭 해 주세요");
      return;
    }
    setParticipants(prev => [...prev, { id: Date.now().toString(), name: newMenu.trim(), multiplier: globalMultiplier }]);
    setNewMenu("");
  };

  const handleRemove = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleChangeMultiplier = (id: string, delta: number) => {
    setParticipants(prev =>
      prev.map(p => p.id === id ? { ...p, multiplier: Math.max(1, p.multiplier + delta) } : p)
    );
  };

  const handleGlobalMultiplierChange = (delta: number) => {
    setGlobalMultiplier(prev => {
      const next = Math.min(1000, Math.max(1, prev + delta));
      setParticipants(parts => parts.map(p => ({ ...p, multiplier: next })));
      return next;
    });
  };

  const handleGlobalMultiplierInput = (value: number) => {
    setGlobalMultiplier(value);
    setParticipants(parts => parts.map(p => ({ ...p, multiplier: value })));
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
                  borderTop: `30px solid ${theme.palette.secondary.main}`,
             }}
          />
        </Box>
      </Box>
      <Box sx={{ mt: 4, display: "flex", justifyContent: "center", mb: 4, position: "relative" }}>
        <Button
          variant="contained"
          size="large"
          onMouseDown={handleChargeStart}
          onMouseUp={handleChargeEnd}
          onMouseLeave={handleChargeEnd}
          onTouchStart={handleChargeStart}
          onTouchEnd={handleChargeEnd}
          disabled={isSpinning}
          sx={{
            borderRadius: 50,
            px: 6,
            py: 1.5,
            fontSize: "1.2rem",
            fontWeight: "bold",
            boxShadow: 4,
            background: isSpinning 
              ? theme.palette.action.disabledBackground
              : `linear-gradient(to right, ${theme.palette.secondary.dark} ${powerGauge}%, ${theme.palette.secondary.main} ${powerGauge}%)`,
            color: theme.palette.background.default,
            transition: "transform 0.2s",
            "&:hover": {
              background: isSpinning
                ? theme.palette.action.disabledBackground
                : `linear-gradient(to right, ${theme.palette.secondary.dark} ${powerGauge}%, ${theme.palette.secondary.main} ${powerGauge}%)`,
              transform: isSpinning ? "none" : "scale(1.05)",
            },
            "&:disabled": {
               backgroundColor: theme.palette.action.disabledBackground,
               color: theme.palette.text.disabled
            },
            "&:active": {
              transform: "scale(0.98)",
            }
          }}
        >
          {isSpinning ? "돌아가는 중..." : isCharging ? "충전 중..." : "꾹 눌러서 돌리기"}
        </Button>
        {powerGauge > 0 && (
          <Typography 
            variant="body2" 
            sx={{ 
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              fontWeight: "bold",
              backgroundColor: theme.palette.background.paper,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              color: powerGauge < 10 ? theme.palette.error.main : theme.palette.secondary.main,
              border: `2px solid ${powerGauge < 10 ? theme.palette.error.main : theme.palette.secondary.main}`,
            }}
          >
            {powerGauge}%
          </Typography>
        )}
      </Box>

      {winningMenu && (
        <Typography
          variant="h5"
          component="p"
          color="secondary"
          align="center"
          sx={{ mt: 2, mb: 2, fontWeight: "bold" }}
        >
          🎉 당첨: {winningMenu} 🎉
        </Typography>
      )}

      <ParticipantList
        participants={participants}
        newName={newMenu}
        globalMultiplier={globalMultiplier}
        onNewNameChange={setNewMenu}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onChangeMultiplier={handleChangeMultiplier}
        onGlobalMultiplierChange={handleGlobalMultiplierChange}
        onGlobalMultiplierInput={handleGlobalMultiplierInput}
        title="목록"
        totalLabel="개"
        inputPlaceholder="새로운 이름"
        emptyText="이름을 추가해주세요!"
      />
    </Box>
  );
};

export default Roulette;
