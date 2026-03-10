"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Divider,
  InputAdornment,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";
import { useSharedParticipants } from "../hooks/useSharedParticipants";

export interface Participant {
  id: string;
  name: string;
  multiplier: number;
}

interface ParticipantListProps {
  title?: string;
  totalLabel?: string;
  inputPlaceholder?: string;
  emptyText?: string;
  /** 'card': wrapped in Paper (default). 'plain': raw Box, for embedding inside an existing Paper. */
  variant?: "card" | "plain";
  /** When false, the add-participant TextField is not rendered (input lives outside the component). */
  showInput?: boolean;
  sx?: SxProps<Theme>;
}

export default function ParticipantList({
  title = "참가자 목록",
  totalLabel = "개",
  inputPlaceholder = "참가자 이름 입력",
  emptyText = "참가자를 추가해주세요",
  variant = "card",
  showInput = true,
  sx,
}: ParticipantListProps) {
  const [newName, setNewName] = useState("");
  const {
    participants,
    globalMultiplier,
    handleAdd: hookHandleAdd,
    handleRemove,
    handleChangeMultiplier,
    handleGlobalMultiplierChange,
    handleGlobalMultiplierInput,
  } = useSharedParticipants();

  const handleAdd = () => {
    hookHandleAdd(newName);
    setNewName("");
  };

  const inner = (
    <>
      {/* Header: title + 전체배수 controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: showInput ? 2 : 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
            전체 배수
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleGlobalMultiplierChange(-1)}
            disabled={globalMultiplier <= 1}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <TextField
            size="small"
            value={globalMultiplier}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1) {
                handleGlobalMultiplierInput(Math.min(1000, val));
              } else if (e.target.value === "") {
                handleGlobalMultiplierInput(1);
              }
            }}
            inputProps={{
              min: 1,
              max: 1000,
              style: { textAlign: "center", padding: "2px 4px", width: 32 },
            }}
            variant="outlined"
            sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.8rem", fontWeight: "bold" } }}
          />
          <IconButton
            size="small"
            onClick={() => handleGlobalMultiplierChange(1)}
            disabled={globalMultiplier >= 1000}
          >
            <AddIcon fontSize="small" />
          </IconButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            총 {participants.reduce((sum, p) => sum + p.multiplier, 0)}{totalLabel}
          </Typography>
        </Box>
      </Box>

      {/* Optional add-participant input */}
      {showInput && (
        <TextField
          fullWidth
          placeholder={inputPlaceholder}
          variant="outlined"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
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
                  disabled={!newName.trim()}
                  size="small"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      )}

      {/* Participant chips */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignContent: "flex-start",
          minHeight: 120,
        }}
      >
        {participants.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ m: "auto" }}>
            {emptyText}
          </Typography>
        )}
        {participants.map((p) => (
          <Box
            key={p.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: "1px solid",
              borderColor: "secondary.main",
              borderRadius: 2,
              px: 1,
              py: 0.5,
              bgcolor: "secondary.main",
              color: "background.paper",
              minWidth: 70,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
                gap: 0.5,
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleRemove(p.id)}
                sx={{ p: 0.25, color: "background.paper" }}
              >
                <CloseIcon sx={{ fontSize: 12 }} />
              </IconButton>
              <Typography
                variant="body2"
                fontWeight="medium"
                noWrap
                sx={{ flex: 1, textAlign: "center", color: "background.paper" }}
              >
                {p.name}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
              <IconButton
                size="small"
                onClick={() => handleChangeMultiplier(p.id, -1)}
                disabled={p.multiplier <= 1}
                sx={{
                  p: 0.25,
                  color: "background.paper",
                  "&.Mui-disabled": { color: "background.paper", opacity: 0.4 },
                }}
              >
                <RemoveIcon sx={{ fontSize: 12 }} />
              </IconButton>
              <Typography
                variant="caption"
                sx={{ minWidth: 24, textAlign: "center", color: "background.paper" }}
              >
                {p.multiplier}x
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleChangeMultiplier(p.id, 1)}
                sx={{ p: 0.25, color: "background.paper" }}
              >
                <AddIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );

  if (variant === "plain") {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minHeight: 0,
          ...(sx as object),
        }}
      >
        {inner}
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, ...(sx as object) }}>
      {inner}
    </Paper>
  );
}
