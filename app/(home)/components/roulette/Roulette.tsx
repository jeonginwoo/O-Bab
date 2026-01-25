"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  useTheme,
} from "@mui/material";

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

    product.forEach((item, i) => {
      const arc = (item.weight / totalWeight) * 2 * Math.PI;
      ctx.beginPath();
      ctx.fillStyle = colors.current[i];
      ctx.moveTo(cw, ch);
      ctx.arc(cw, ch, cw, startAngle, startAngle + arc);
      ctx.fill();
      ctx.closePath();
      startAngle += arc;
    });

    ctx.fillStyle = theme.palette.primary.main;
    ctx.font = "16px Roboto";
    ctx.textAlign = "center";
    startAngle = 0;

    product.forEach((item) => {
      const itemAngle = startAngle + (item.weight / totalWeight) * Math.PI;
      ctx.save();
      ctx.translate(
        cw + Math.cos(itemAngle) * (cw - 50),
        ch + Math.sin(itemAngle) * (ch - 50)
      );
      ctx.rotate(itemAngle + Math.PI / 2);
      ctx.fillText(item.name, 0, 0);
      ctx.restore();
      startAngle += (item.weight / totalWeight) * 2 * Math.PI;
    });
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

      const totalWeight = product.reduce((sum, item) => sum + item.weight, 0);
      const finalAngle = angle.current % 360;
      const winningAngle = (270 - finalAngle + 360) % 360;
      const winningAngleRad = (winningAngle * Math.PI) / 180;

      let start = 0;
      for (let i = 0; i < product.length; i++) {
        const arc = (product[i].weight / totalWeight) * 2 * Math.PI;
        if (winningAngleRad >= start && winningAngleRad < start + arc) {
          setTimeout(
            () => alert(`오늘의 점심은?! 🎉 ${product[i].name} 🎉`),
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

    currentSpeed.current = Math.random() * 10 + 15;
    angle.current = 0;
    stopRequested.current = false;
    rotateInterval.current = setInterval(spin, 10);

    setTimeout(() => {
      stopRequested.current = true;
    }, Math.random() * 2000 + 2000);
  };

  const handleAdd = () => {
    if (newMenu.trim()) {
      setProduct([...product, { name: newMenu.trim(), weight: 5 }]);
      setNewMenu("");
    } else {
      alert("메뉴를 입력한 후 버튼을 클릭 해 주세요");
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
  }, [product]);

  useEffect(() => {
    draw();
  }, [product]);

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
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: `20px solid ${theme.palette.secondary.main}`,
          }}
        />
      </Box>
      <Box sx={{ mt: 3, display: "flex", gap: 1, justifyContent: "center" }}>
        <TextField
          fullWidth
          label="메뉴 추가"
          variant="outlined"
          value={newMenu}
          onChange={(e) => setNewMenu(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
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
          onClick={handleAdd}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.default,
            "&:hover": { backgroundColor: theme.palette.secondary.dark },
            padding: "8px 12px",
          }}
        >
          추가
        </Button>
        <Button
          variant="contained"
          onClick={handleRotate}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.default,
            "&:hover": { backgroundColor: theme.palette.secondary.dark },
            padding: "8px 12px",
          }}
        >
          돌리기
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ mt: 3, backgroundColor: "transparent" }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.secondary,
                  textAlign: "center",
                  width: "25%",
                  backgroundColor: theme.palette.action.hover,
                }}
              >
                메뉴
              </TableCell>
              <TableCell
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.secondary,
                  textAlign: "center",
                  backgroundColor: theme.palette.action.hover,
                }}
              >
                비중
              </TableCell>
              <TableCell
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.secondary,
                  textAlign: "center",
                  backgroundColor: theme.palette.action.hover,
                }}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {product.map((item, index) => (
              <TableRow key={index}>
                <TableCell
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary,
                    textAlign: "center",
                    width: "25%",
                  }}
                >
                  {item.name}
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary,
                    textAlign: "center",
                  }}
                >
                  <TextField
                    type="number"
                    value={item.weight}
                    onChange={(e) => handleWeightChange(index, e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    color="secondary"
                    sx={{
                      "& .MuiInputBase-root": {
                        color: theme.palette.text.primary,
                      },
                    }}
                    inputProps={{ style: { textAlign: "center" } }}
                    InputLabelProps={{
                      sx: {
                        color: theme.palette.text.secondary,
                        "&.Mui-focused": {
                          color: theme.palette.secondary.main,
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary,
                    textAlign: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(index)}
                    size="small"
                  >
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Roulette;
