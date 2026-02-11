"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface MenuItem {
  name: string;
  weight: number;
}

const Roulette = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [product, setProduct] = useState<MenuItem[]>([
    { name: "돈토", weight: 5 },
    { name: "윤스", weight: 5 },
  ]);
  const [newMenu, setNewMenu] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningMenu, setWinningMenu] = useState<string | null>(null);
  const colors = useRef<string[]>([]);
  const angle = useRef(0);
  const currentSpeed = useRef(0);
  const rotateInterval = useRef<NodeJS.Timeout | null>(null);
  const stopRequested = useRef(false);
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
    const totalWeight = product.reduce((sum, item) => sum + item.weight, 0);
    let startAngle = 0;

    if (colors.current.length !== product.length) {
      colors.current = product.map(() => generatePastelColor());
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
    product.forEach((item, i) => {
      const arc = (item.weight / totalWeight) * 2 * Math.PI;
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

    product.forEach((item) => {
      const itemAngle = startAngle + (item.weight / totalWeight) * Math.PI;
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
      startAngle += (item.weight / totalWeight) * 2 * Math.PI;
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

      const totalWeight = product.reduce((sum, item) => sum + item.weight, 0);
      const finalAngle = angle.current % 360;
      const winningAngle = (270 - finalAngle + 360) % 360;
      const winningAngleRad = (winningAngle * Math.PI) / 180;

      let start = 0;
      for (let i = 0; i < product.length; i++) {
        const arc = (product[i].weight / totalWeight) * 2 * Math.PI;
        if (winningAngleRad >= start && winningAngleRad < start + arc) {
          setTimeout(
            () => setWinningMenu(product[i].name),
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

  const handleRotate = () => {
    if (product.length <= 1) {
      alert("메뉴는 최소 2개 이상이어야 합니다.");
      return;
    }
    if (rotateInterval.current) return;

    setWinningMenu(null);
    setIsSpinning(true);
    currentSpeed.current = Math.random() * 10 + 15;
    angle.current = 0;
    stopRequested.current = false;
    rotateInterval.current = setInterval(spin, 10);

    setTimeout(() => {
      stopRequested.current = true;
    }, Math.random() * 1000 + 1000);
  };

  const handleAdd = () => {
    if (newMenu.trim()) {
      setProduct([...product, { name: newMenu.trim(), weight: 5 }]);
      setNewMenu("");
    } else {
      alert("이름을 입력한 후 버튼을 클릭 해 주세요");
    }
  };

  const handleDelete = (index: number) => {
    setProduct(product.filter((_, i) => i !== index));
  };

  const handleWeightChange = (index: number, newWeightInput: string) => {
    let newWeight: number;
    if (newWeightInput === "" || isNaN(parseFloat(newWeightInput))) {
      newWeight = 1;
    } else {
      newWeight = parseFloat(newWeightInput);
      if (newWeight < 1) {
        newWeight = 1;
      }
    }

    const updatedProduct = [...product];
    updatedProduct[index].weight = newWeight;
    setProduct(updatedProduct);
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
  }, [product, theme]);

  useEffect(() => {
    draw();
  }, [product, theme]);

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
      <Box sx={{ mt: 4, display: "flex", justifyContent: "center", mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleRotate}
          disabled={isSpinning}
          sx={{
            borderRadius: 50,
            px: 6,
            py: 1.5,
            fontSize: "1.2rem",
            fontWeight: "bold",
            boxShadow: 4,
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.default,
            "&:hover": {
              backgroundColor: theme.palette.secondary.dark,
              transform: "scale(1.05)",
              transition: "transform 0.2s",
            },
            "&:disabled": {
               backgroundColor: theme.palette.action.disabledBackground,
               color: theme.palette.text.disabled
            }
          }}
        >
          {isSpinning ? "돌아가는 중..." : "돌리기"}
        </Button>
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

      <Card
        elevation={3}
        sx={{ borderRadius: 4, backgroundColor: theme.palette.background.paper }}
      >
        <CardHeader
          title="목록"
          titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
          action={
            <Typography
              variant="caption"
              sx={{
                display: "block",
                pt: 1.5,
                pr: 1,
                color: theme.palette.text.secondary,
              }}
            >
              총 {product.length}개
            </Typography>
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="새로운 이름"
              variant="outlined"
              value={newMenu}
              onChange={(e) => setNewMenu(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              size="small"
              color="secondary"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleAdd}
                      edge="end"
                      color="secondary"
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: theme.palette.text.primary,
                  "& fieldset": {
                    borderColor: theme.palette.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.palette.text.secondary,
                  },
                },
              }}
            />
          </Box>

          <List dense sx={{ maxHeight: 300, overflow: "auto" }}>
            {product.map((item, index) => (
              <ListItem
                key={index}
                divider={index !== product.length - 1}
                sx={{
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(index)}
                    size="small"
                  >
                    <DeleteIcon color="error" fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mr: 2,
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    비중
                  </Typography>
                  <TextField
                    type="number"
                    value={item.weight}
                    onChange={(e) => handleWeightChange(index, e.target.value)}
                    variant="standard"
                    size="small"
                    inputProps={{
                      style: { textAlign: "center", width: "50px" },
                      min: 1,
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        color: theme.palette.text.primary,
                      },
                    }}
                  />
                </Box>
              </ListItem>
            ))}
            {product.length === 0 && (
              <Typography
                textAlign="center"
                color="text.secondary"
                sx={{ py: 4 }}
              >
                목록을 추가해주세요!
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Roulette;
