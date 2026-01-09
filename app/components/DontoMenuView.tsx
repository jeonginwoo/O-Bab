"use client";

import { Box } from "@mui/material";
import React, { useState, useEffect } from "react";

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
  const [fitStyle, setFitStyle] = useState<{ width?: string; height?: string }>(
    {}
  );

  useEffect(() => {
    if (view !== "modal") return;

    const calculateSize = () => {
      const containerWidth = window.innerWidth * 0.8;
      const containerHeight = window.innerHeight * 0.9;

      if (containerWidth === 0 || containerHeight === 0) return;

      const targetRatio = 5 / 4;

      let newWidth;
      let newHeight;

      if (containerWidth / containerHeight > targetRatio) {
        newHeight = containerHeight;
        newWidth = containerHeight * targetRatio;
      } else {
        newWidth = containerWidth;
        newHeight = containerWidth / targetRatio;
      }

      setFitStyle({
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      });
    };

    calculateSize();

    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, [view]);

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

          ...fitStyle,

          aspectRatio: fitStyle.width ? undefined : "5 / 4",
        }}
      >
        <Box
          sx={{
            width: "calc(50% - 1px)",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "background.paper",
          }}
        >
          <img
            src={menuImages[0].url}
            alt={`${menuTitle} menu image 1`}
            style={{
              width: "160%",
              height: "100%",
              objectFit: "cover",
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
            backgroundColor: "background.paper",
          }}
        >
          <img
            src={menuImages[1].url}
            alt={`${menuTitle} menu image 2`}
            style={{
              width: "160%",
              height: "100%",
              objectFit: "cover",
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
