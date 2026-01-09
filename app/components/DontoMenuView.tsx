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
  // fitStyle 상태 관리 (modal 뷰에서만 사용)
  const [fitStyle, setFitStyle] = useState<{ width?: string; height?: string }>({});

  // ViewArea의 로직을 응용하여 90% 뷰포트 내에서 5:4 비율 유지 계산
  useEffect(() => {
    if (view !== "modal") return;

    const calculateSize = () => {
      // 1. 기준 컨테이너 크기 설정 (화면의 90%)
      const containerWidth = window.innerWidth * 0.9;
      const containerHeight = window.innerHeight * 0.9;

      if (containerWidth === 0 || containerHeight === 0) return;

      // 2. 목표 비율 설정 (5:4 = 1.25)
      const targetRatio = 5 / 4;
      
      let newWidth;
      let newHeight;

      // 3. ViewArea와 동일한 비율 피팅 로직 적용
      // 컨테이너가 목표 비율보다 더 납작하면(가로가 길면) -> 높이 기준으로 맞춤
      if (containerWidth / containerHeight > targetRatio) {
        newHeight = containerHeight;
        newWidth = containerHeight * targetRatio;
      } else {
        // 컨테이너가 목표 비율보다 더 홀쭉하면(세로가 길면) -> 너비 기준으로 맞춤
        newWidth = containerWidth;
        newHeight = containerWidth / targetRatio;
      }

      setFitStyle({
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      });
    };

    // 초기 계산
    calculateSize();

    // 리사이즈 이벤트 리스너 등록
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
          // 기존 max값 제거하고 계산된 fitStyle 적용
          // 중앙 정렬을 위해 margin auto 등의 처리가 필요할 수 있음 (부모 컨테이너에 따라 다름)
          ...fitStyle, 
          // 로딩 전 깜빡임 방지용 기본 비율
          aspectRatio: fitStyle.width ? undefined : "5 / 4", 
        }}
      >
        <Box
          sx={{
            width: "calc(50% - 1px)",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "background.paper", // 이미지가 로딩되기 전 배경색
          }}
        >
          <img
            src={menuImages[0].url}
            alt={`${menuTitle} menu image 1`}
            style={{
              width: "160%",
              height: "100%", // 높이를 꽉 채우도록 수정 (objectFit 사용 시 유리)
              objectFit: "cover", // contain보다는 cover가 자연스러울 수 있음 (원본 의도에 따라 변경 가능)
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
