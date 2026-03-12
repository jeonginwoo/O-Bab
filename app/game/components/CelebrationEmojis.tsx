"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";

const EMOJIS = ["🎉", "✨", "🎊", "🥳", "🎈", "🌟", "💫", "🏆", "⭐", "🎯"];

interface Particle {
  id: number;
  left: number;
  top: number;
  fontSize: number;
  duration: number;
  delay: number;
  translateY: number;
  rotate: number;
  emoji: string;
}

interface CelebrationEmojisProps {
  show: boolean;
  emojis?: string[];
}

const CelebrationEmojis: React.FC<CelebrationEmojisProps> = ({ show, emojis }) => {
  const emojiList = emojis && emojis.length > 0 ? emojis : EMOJIS;
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }
    setParticles(
      [...Array(30)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        fontSize: Math.random() * 20 + 20,
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 0.5,
        translateY: Math.random() * 400 + 200,
        rotate: Math.random() * 720 - 360,
        emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
      }))
    );
  }, [show]);

  if (!show || particles.length === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {particles.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: `${p.fontSize}px`,
            opacity: 0,
            animation: `celebrate-${p.id} ${p.duration}s ease-out ${p.delay}s forwards`,
            [`@keyframes celebrate-${p.id}`]: {
              "0%": { transform: "translateY(100px) rotate(0deg)", opacity: 0 },
              "20%": { opacity: 1 },
              "100%": {
                transform: `translateY(-${p.translateY}px) rotate(${p.rotate}deg)`,
                opacity: 0,
              },
            },
          }}
        >
          {p.emoji}
        </Box>
      ))}
    </Box>
  );
};

export default CelebrationEmojis;
