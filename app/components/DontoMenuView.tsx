"use client";

import { Box } from "@mui/material";
import React from "react";

interface Media {
  type: string;
  url: string;
}

interface DontoMenuViewProps {
  menuImages: Media[];
  menuTitle: string;
  view: "preview" | "modal";
  onClick?: () => void;
}

const DontoMenuView: React.FC<DontoMenuViewProps> = ({
  menuImages,
  menuTitle,
  view,
  onClick,
}) => {
  if (menuImages.length < 2) {
    return null;
  }

  if (view === "preview") {
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          borderRadius: 1,
          overflow: "hidden",
          mb: 2,
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        <Box
          sx={{
            width: "calc(50% - 0.5px)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={menuImages[0].url}
            alt={`${menuTitle} menu image 1`}
            style={{
              width: "160%",
              height: "auto",
              display: "block",
              marginLeft: "-30%",
            }}
          />
        </Box>
        <Box
          sx={{
            width: "1px",
            borderLeft: "1px dashed",
            borderLeftColor: "text.secondary",
            flexShrink: 0,
          }}
        />
        <Box
          sx={{
            width: "calc(50% - 0.5px)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={menuImages[1].url}
            alt={`${menuTitle} menu image 2`}
            style={{
              width: "160%",
              height: "auto",
              display: "block",
              marginLeft: "-30%",
            }}
          />
        </Box>
      </Box>
    );
  }

  if (view === "modal") {
    return (
      <Box
        sx={{
          display: "flex",
          maxWidth: "90vw",
          maxHeight: "90vh",
        }}
      >
        <Box
          sx={{
            width: "calc(50% - 1px)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={menuImages[0].url}
            alt={`${menuTitle} menu image 1`}
            style={{
              width: "160%",
              height: "auto",
              display: "block",
              marginLeft: "-30%",
            }}
          />
        </Box>
        <Box
          sx={{
            width: "2px",
            borderLeft: "2px dashed",
            borderLeftColor: "text.secondary",
            flexShrink: 0,
          }}
        />
        <Box
          sx={{
            width: "calc(50% - 1px)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={menuImages[1].url}
            alt={`${menuTitle} menu image 2`}
            style={{
              width: "160%",
              height: "auto",
              display: "block",
              marginLeft: "-30%",
            }}
          />
        </Box>
      </Box>
    );
  }

  return null;
};

export default DontoMenuView;
