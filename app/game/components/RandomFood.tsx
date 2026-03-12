"use client";

import React, { useState } from "react";
import { Box, Button, Typography, useTheme, Zoom } from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import CelebrationEmojis from "./CelebrationEmojis";

const foodList = [
  "김치찌개", "된장찌개", "부대찌개", "비빔밥", "불고기",
  "제육볶음", "돈까스", "삼겹살", "족발", "보쌈",
  "치킨", "피자", "파스타", "햄버거", "샌드위치",
  "떡볶이", "김밥", "라면", "칼국수", "수제비",
  "냉면", "짜장면", "짬뽕", "탕수육", "볶음밥",
  "초밥", "회덮밥", "카레", "쌀국수", "마라탕",
  "국밥", "감자탕", "순두부찌개", "설렁탕", "갈비탕"
];

const RandomFood = () => {
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const theme = useTheme();

  const handleRecommend = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setShowCelebration(false);
    
    const totalSteps = 30 + Math.floor(Math.random() * 10);
    
    const animate = (step: number) => {
      const randomIndex = Math.floor(Math.random() * foodList.length);
      setSelectedFood(foodList[randomIndex]);

      if (step < totalSteps) {
        // 점점 느려지는 효과
        const delay = 50 + (Math.pow(step / totalSteps, 2) * 350);
        setTimeout(() => animate(step + 1), delay);
      } else {
        setIsAnimating(false);
        setShowCelebration(true);
      }
    };

    animate(0);
  };

  return (
    <Box sx={{ textAlign: "center", display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', minHeight: '500px', position: 'relative', overflow: 'hidden' }}>
        <CelebrationEmojis
          show={showCelebration}
          emojis={['🍕', '🍱', '🍜', '🍲', '🍗', '🍣', '🍔', '🍛', '🥘', '🍝']}
        />
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zoom in={true}>
                <Typography 
                    variant="h3" 
                    component="div" 
                    sx={{ 
                        fontWeight: 'bold', 
                        color: theme.palette.secondary.main,
                        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        ...(showCelebration && {
                            animation: 'shimmer 1.5s infinite alternate ease-in-out',
                            '@keyframes shimmer': {
                                '0%': { textShadow: `0 0 10px ${theme.palette.secondary.main}` },
                                '50%': { textShadow: `0 0 30px ${theme.palette.secondary.main}` },
                                '100%': { textShadow: `0 0 10px ${theme.palette.secondary.main}` },
                            },
                        }),
                        textShadow: showCelebration ? undefined : 'none',
                        transform: showCelebration ? 'scale(1.2)' : 'scale(1)',
                    }}
                >
                    {selectedFood || "오늘 뭐 먹지?"}
                </Typography>
            </Zoom>
        </Box>

      <Box sx={{ mb: 4, zIndex: 1 }}>
        <Button
            variant="contained"
            size="large"
            onClick={handleRecommend}
            startIcon={<RestaurantMenuIcon />}
            disabled={isAnimating}
            sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.default,
            "&:hover": { backgroundColor: theme.palette.secondary.dark },
            px: 4,
            py: 1.5,
            fontSize: '1.2rem'
            }}
        >
            {isAnimating ? "고르는 중..." : "메뉴 추천받기"}
        </Button>
      </Box>
    </Box>
  );
};

export default RandomFood;
