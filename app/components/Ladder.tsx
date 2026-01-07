"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
    Box, TextField, Button, Slider, Typography, useTheme 
} from '@mui/material';

// Define types for clarity
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
    const [gameState, setGameState] = useState<'initial' | 'started' | 'tracing' | 'finished'>('initial'); // Added 'tracing'
    const [playerInput, setPlayerInput] = useState('');
    const theme = useTheme();

    const drawLadder = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || players.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const num = players.length;
        const actualCanvasWidth = canvas.offsetWidth; // Get the actual rendered width
        const height = ladderHeight;
        canvas.width = actualCanvasWidth; // Set drawing buffer to actual width
        canvas.height = height;
        // Adjust step calculation to reduce side margins
        const step = actualCanvasWidth / (num + 1); // Keep same logic, but with dynamic width
        const minRungGap = 30;
        const rungCount = Math.floor((height - 70) / 50);
        const segmentHeight = (height - 70) / rungCount;
        const newLadderData: Rung[][] = [];

        ctx.clearRect(0, 0, actualCanvasWidth, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = theme.palette.text.primary; 
        ctx.fillStyle = theme.palette.text.primary;   
        ctx.font = '14px Roboto';
        ctx.textAlign = 'center';

        for (let i = 0; i < num; i++) {
            const x = step * (i + 1);
            ctx.fillText(names[i] || '', x, 20);
            ctx.beginPath();
            ctx.moveTo(x, 30);
            ctx.lineTo(x, height - 30);
            ctx.stroke();
            ctx.fillText(results[i] || '', x, height - 10);
        }

        for (let i = 0; i < num - 1; i++) {
            const rungs: Rung[] = [];
            for (let j = 0; j < rungCount; j++) {
                const x1 = step * (i + 1);
                const x2 = step * (i + 2);
                let y: number = 0; // Initialize y with a number type
                let attempts = 0;
                do {
                    y = 40 + (segmentHeight * j) + (Math.random() * segmentHeight * 0.8) + (segmentHeight * 0.1);
                    attempts++;
                } while (
                    (rungs.some(r => Math.abs(r.y - y) < minRungGap) ||
                    (i > 0 && newLadderData[i-1] && newLadderData[i-1].some(r => Math.abs(r.y - y) < minRungGap))) &&
                    attempts < 50
                );
                
                rungs.push({y, x1, x2});
                ctx.beginPath();
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
                ctx.stroke();
            }
            newLadderData.push(rungs.sort((a,b) => a.y - b.y));
        }
        setLadderData(newLadderData);
    }, [players, names, results, ladderHeight, theme.palette.text.primary]);

    const randomizeAndDraw = useCallback((currentPlayers: string[]) => {
        const shuffledResults = [...currentPlayers].sort(() => Math.random() - 0.5);
        const newNames = new Array(currentPlayers.length).fill('');
        const coffeeIndex = Math.floor(Math.random() * currentPlayers.length);
        newNames[coffeeIndex] = '커피';
        
        setResults(shuffledResults);
        setNames(newNames);
    }, []);
    
    const handleStart = () => {
        const parsedPlayers = playerInput.split(',').map(s => s.trim()).filter(Boolean);
        if (parsedPlayers.length < 2) {
            alert('이름을 2명 이상 입력해주세요.');
            return;
        }
        setPlayers(parsedPlayers);
        randomizeAndDraw(parsedPlayers);
        setGameState('started');
    };

    const handleRetry = () => {
        randomizeAndDraw(players);
        setGameState('started');
    };

    // Reset is now just a state change, not a separate button
    const handleReset = () => {
        setPlayers([]);
        setResults([]);
        setNames([]);
        setPlayerInput('');
        setGameState('initial');
    };
    
    const animatePath = useCallback((path: PathPoint[]) => {
        let i = 0;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function drawSegment(currentCtx: CanvasRenderingContext2D) { // Add currentCtx parameter
            if (i < path.length - 1) {
                currentCtx.save(); // Use currentCtx
                currentCtx.beginPath();
                currentCtx.moveTo(path[i].x, path[i].y);
                currentCtx.lineTo(path[i+1].x, path[i+1].y);
                currentCtx.strokeStyle = theme.palette.secondary.main; 
                currentCtx.lineWidth = 3;
                currentCtx.stroke();
                currentCtx.restore();
                i++;
                setTimeout(() => drawSegment(currentCtx), 50); // Pass currentCtx in recursive call
            } else {
                setGameState('finished'); // Set to finished when animation completes
            }
        }
        drawSegment(ctx); // Initial call, pass ctx
    }, [theme.palette.secondary.main]);

    const handleTrace = useCallback(() => {
        setGameState('tracing'); // Set to tracing immediately on trace click
        const coffeeIndex = names.indexOf('커피');
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

        path.push({x: currentX, y: currentY});

        while(currentY < height - 30) {
            let nextRung: (Rung & { direction: 'left' | 'right' }) | null = null;

            if (currentLane < players.length - 1 && ladderData[currentLane]) {
                for (const rung of ladderData[currentLane]) {
                    if (rung.y > currentY) {
                        nextRung = { ...rung, direction: 'right' };
                        break;
                    }
                }
            }
            if (currentLane > 0 && ladderData[currentLane - 1]) {
                for (const rung of ladderData[currentLane - 1]) {
                    if (rung.y > currentY) {
                        if (!nextRung || rung.y < nextRung.y) {
                            nextRung = { ...rung, direction: 'left' };
                        }
                        break;
                    }
                }
            }

            if (nextRung) {
                path.push({ x: currentX, y: nextRung.y });
                currentY = nextRung.y;
                if (nextRung.direction === 'right') {
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
        
        animatePath(path);
    }, [names, players.length, ladderData, ladderHeight, animatePath]);
    
    useEffect(() => {
        if (gameState === 'started') {
            drawLadder();
        }
    }, [gameState, drawLadder]);

    return (
        <Box sx={{ p: 2 }}>
            {gameState === 'initial' && (
                 <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <TextField
                        fullWidth
                        label="이름 (쉼표로 구분)"
                        variant="outlined"
                        value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                        size="small"
                        sx={{
                            '& .MuiInputBase-root': { color: theme.palette.text.primary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.text.secondary },
                            '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.secondary.main },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.secondary.main },
                        }}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleStart} 
                        sx={{ 
                            backgroundColor: theme.palette.secondary.main, 
                            color: theme.palette.primary.main,
                            '&:hover': { backgroundColor: theme.palette.secondary.dark }
                        }}
                    >
                        시작
                    </Button>
                </Box>
            )}
            {gameState !== 'initial' && (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                    <Button 
                        variant="contained" 
                        onClick={handleRetry} 
                        disabled={gameState === 'tracing'} 
                        sx={{ // Adjusted color from info to secondary for consistency with theme.
                            backgroundColor: theme.palette.secondary.main, 
                            color: theme.palette.primary.main,
                            '&:hover': { backgroundColor: theme.palette.secondary.dark }
                        }}
                    >
                        다시하기
                    </Button>
                    <Button 
                        variant="contained" 
                        color="success" 
                        onClick={handleTrace} 
                        disabled={gameState === 'finished' || gameState === 'tracing'} 
                        sx={{ 
                            backgroundColor: theme.palette.success.main, 
                            color: theme.palette.success.contrastText,
                            '&:hover': { backgroundColor: theme.palette.success.dark }
                        }}
                    >
                        결과 확인
                    </Button>
                    {/* Removed Reset Button */}
                </Box>
            )}
            
            {players.length > 0 && (
                 <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom color="text.primary">
                        사다리 길이: {ladderHeight}px
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
                        sx={{ width: '90%', mx: 'auto' }}
                    />
                </Box>
            )}

            <canvas ref={canvasRef} style={{ marginTop: theme.spacing(2), backgroundColor: theme.palette.background.paper, borderRadius: theme.shape.borderRadius, width: '100%', display: 'block' }}></canvas>
        </Box>
    );
};

export default Ladder;
