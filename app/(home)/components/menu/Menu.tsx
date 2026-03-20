"use client";

import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Box,
  ImageList,
  ImageListItem,
  Modal,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DontoMenuView from "./DontoMenuView";
import { detectMenuImages, getAvgBrightness, type MediaImage } from "../../utils/menuImageDetector";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// 식당별 메뉴 이미지 설정 (폴백용 - 자동 감지 실패 시 사용)
const MENU_IMAGE_CONFIG: Record<string, {
  position?: 'first' | 'last'; // 이미지 목록에서 메뉴판 위치
  count?: number;              // 메뉴판 이미지 개수
  indices?: number[];          // 사용할 메뉴판 이미지 인덱스 (명시적 지정)
  exclude?: number[];          // 제외할 이미지 인덱스
  menuBrightnessMax?: number;  // 이 밝기 이하면 메뉴 이미지로 판단
  dinnerIndex?: number;        // 메뉴 이미지가 3개일 때 제외할 인덱스 (저녁 메뉴)
}> = {
  돈토: { menuBrightnessMax: 100, dinnerIndex: 1, position: 'first', count: 2 },  // 어두운 이미지=메뉴판, 메뉴 3개면 1=저녁메뉴 제외
  윤스: { position: 'first', count: 1 },
};

// MediaImage 타입을 utils에서 가져와서 Media로 사용
type Media = MediaImage;

interface Content {
  t: string;
  v: string;
}
interface MenuItem {
  title: string;
  contents: Content[];
  media: Media[];
  created_at?: number;
  updated_at?: number;
}
interface ApiResponse {
  items: any[];
}

function Menu({ title, apiUrl }: { title:string; apiUrl: string }) {
  const [menu, setMenu] = useState<MenuItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);
  const [modalImageStyle, setModalImageStyle] = useState({});

  useEffect(() => {
    if (!openModal) return;

    const calculateImageStyle = () => {
      setModalImageStyle({
        maxWidth: "90vw",
        maxHeight: `${window.innerHeight * 0.9}px`,
        objectFit: "contain",
      });
    };

    calculateImageStyle();
    window.addEventListener("resize", calculateImageStyle);

    return () => {
      window.removeEventListener("resize", calculateImageStyle);
    };
  }, [openModal]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;
        const response = await axios.get(proxyUrl);
        const data: ApiResponse = response.data;
        const menuItem = data.items.find((item) => !item.pinned);
        if (menuItem) {
          setMenu(menuItem);
        } else {
          setError("No available menu found.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiUrl]);

  const allImages: string[] = React.useMemo(() => {
    if (!menu) return [];
    const imageMedia = menu.media.filter((m) => m.type === "image");
    if (imageMedia.length === 0) return [];

    // 자동 감지 시도
    const detected = detectMenuImages(imageMedia);
    let menuImages: Media[];
    let foodImages: Media[];

    if (detected) {
      // 자동 감지 성공
      menuImages = detected.menuImages;
      foodImages = detected.foodImages;
    } else {
      // 폴백: 설정 사용
      const config = MENU_IMAGE_CONFIG[title];
      if (config) {
        let filtered: Media[];
        if (config.menuBrightnessMax != null) {
          // 밝기 기반으로 메뉴/음식 이미지 분류
          const menuIndices = imageMedia
            .map((img, i) => ({ img, i }))
            .filter(({ img }) => getAvgBrightness(img.avg || '#ffffff') <= config.menuBrightnessMax!);
          // 메뉴 이미지가 3개면 저녁 메뉴(dinnerIndex) 제외
          const finalMenuIndices = (menuIndices.length >= 3 && config.dinnerIndex != null)
            ? menuIndices.filter(({ i }) => i !== config.dinnerIndex)
            : menuIndices;
          const menuIndexSet = new Set(finalMenuIndices.map(({ i }) => i));
          menuImages = finalMenuIndices.slice(0, config.count).map(({ img }) => img);
          foodImages = imageMedia.filter((_, i) => !menuIndexSet.has(i));
        } else if (config.exclude) {
          filtered = imageMedia.filter((_, i) => !config.exclude!.includes(i));
          if (config.indices) {
            menuImages = config.indices.map((i) => filtered[i]).filter(Boolean);
            foodImages = filtered.filter((_, i) => !config.indices!.includes(i));
          } else if (config.position === 'first') {
            menuImages = filtered.slice(0, config.count);
            foodImages = filtered.slice(config.count);
          } else if (config.position === 'last') {
            menuImages = filtered.slice(-(config.count ?? 1));
            foodImages = filtered.slice(0, -(config.count ?? 1));
          } else {
            menuImages = filtered;
            foodImages = [];
          }
        } else {
          filtered = imageMedia;
          if (config.indices) {
            menuImages = config.indices.map((i) => filtered[i]).filter(Boolean);
            foodImages = filtered.filter((_, i) => !config.indices!.includes(i));
          } else if (config.position === 'first') {
            menuImages = filtered.slice(0, config.count);
            foodImages = filtered.slice(config.count);
          } else if (config.position === 'last') {
            menuImages = filtered.slice(-(config.count ?? 1));
            foodImages = filtered.slice(0, -(config.count ?? 1));
          } else {
            menuImages = filtered;
            foodImages = [];
          }
        }
      } else {
        menuImages = [];
        foodImages = imageMedia;
      }
    }

    if (title === "돈토" && menuImages.length >= 2) {
      // 돈토는 특수 뷰를 먼저 보여주고 음식 이미지를 나중에
      const foodImagesSrc = foodImages.map((m) => m.url);
      return ["combined_donto_view", ...foodImagesSrc];
    } else {
      // 다른 식당은 메뉴판 먼저, 음식 이미지 나중에
      const menuImagesSrc = menuImages.map((m) => m.url);
      const foodImagesSrc = foodImages.map((m) => m.url);
      return [...menuImagesSrc, ...foodImagesSrc];
    }
  }, [menu, title]);

  const dontoMenuImages: Media[] = React.useMemo(() => {
    if (!menu || title !== "돈토") return [];
    const imageMedia = menu.media.filter((m) => m.type === "image");
    const detected = detectMenuImages(imageMedia);
    if (detected) return detected.menuImages;
    const config = MENU_IMAGE_CONFIG[title];
    if (config) {
      if (config.menuBrightnessMax != null) {
        const menuCandidates = imageMedia
          .map((img, i) => ({ img, i }))
          .filter(({ img }) => getAvgBrightness(img.avg || '#ffffff') <= config.menuBrightnessMax!);
        const finalCandidates = (menuCandidates.length >= 3 && config.dinnerIndex != null)
          ? menuCandidates.filter(({ i }) => i !== config.dinnerIndex)
          : menuCandidates;
        return finalCandidates.slice(0, config.count).map(({ img }) => img);
      }
      const filtered = config.exclude
        ? imageMedia.filter((_, i) => !config.exclude!.includes(i))
        : imageMedia;
      if (config.indices) return config.indices.map((i) => filtered[i]).filter(Boolean);
      if (config.position === 'first') return filtered.slice(0, config.count);
      if (config.position === 'last') return filtered.slice(-(config.count ?? 1));
      return filtered;
    }
    return imageMedia.slice(0, 2);
  }, [menu, title]);

  const handleImageClick = (imageUrl: string) => {
    const index = allImages.indexOf(imageUrl);
    if (index !== -1) {
      setInitialSlide(index);
      setOpenModal(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const renderImages = () => {
    if (!menu || !menu.media || menu.media.length === 0) return null;

    const imageMedia = menu.media.filter((m) => m.type === "image");
    if (imageMedia.length === 0) return null;

    let menuImages: Media[] = [];
    let foodImages: Media[] = [];

    // 1단계: 자동 감지 시도
    const detected = detectMenuImages(imageMedia);
    
    if (detected) {
      // 자동 감지 성공
      menuImages = detected.menuImages;
      foodImages = detected.foodImages;
    } else {
      // 2단계: 자동 감지 실패 시 설정값 사용
      const config = MENU_IMAGE_CONFIG[title];
      
      if (config) {
        const filtered = config.exclude
          ? imageMedia.filter((_, i) => !config.exclude!.includes(i))
          : imageMedia;
        if (config.indices) {
          menuImages = config.indices.map((i) => filtered[i]).filter(Boolean);
          foodImages = filtered.filter((_, i) => !config.indices!.includes(i));
        } else if (config.position === 'first') {
          menuImages = filtered.slice(0, config.count);
          foodImages = filtered.slice(config.count);
        } else if (config.position === 'last') {
          menuImages = filtered.slice(-(config.count ?? 1));
          foodImages = filtered.slice(0, -(config.count ?? 1));
        } else {
          menuImages = filtered;
          foodImages = [];
        }
      } else {
        // 3단계: 설정도 없으면 모두 음식 이미지로 처리
        foodImages = imageMedia;
      }
    }

    return (
      <Box sx={{ mt: 2 }}>
        {title === "돈토" && menu && menuImages.length >= 2 ? (
          <DontoMenuView
            menuImages={menuImages}
            menuTitle={menu.title}
            view="preview"
            onClick={() => handleImageClick("combined_donto_view")}
          />
        ) : (
          menuImages.map((media, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                borderRadius: 1,
                overflow: 'hidden',
                '&:hover img': { opacity: 0.8 },
              }}
            >
              <img
                src={media.url}
                alt={`${menu.title} menu image ${index + 1}`}
                style={{
                  width: "100%",
                  height: "auto",
                  display: 'block',
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: 'opacity 0.2s',
                }}
                onClick={() => handleImageClick(media.url)}
              />
            </Box>
          ))
        )}
        {foodImages.length > 0 && (
          <ImageList sx={{ mt: 2 }} cols={3} gap={8}>
            {foodImages.map((media, index) => (
              <ImageListItem
                key={index}
                onClick={() => handleImageClick(media.url)}
                sx={{
                  borderRadius: 1,
                  overflow: 'hidden',
                  aspectRatio: '5 / 4',
                  '&:hover img': { opacity: 0.8 },
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={media.url}
                  alt={`${menu.title} food image ${index + 1}`}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: 'block',
                    objectFit: 'cover',
                    borderRadius: 4,
                    cursor: "pointer",
                    transition: 'opacity 0.2s',
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Box>
    );
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: 'relative',
        border: (t) => `1px solid ${t.palette.primary.main}22`,
        backgroundColor: (t) => `${t.palette.background.paper}e8`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.28s ease',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          boxShadow: (t) => `0 20px 48px ${t.palette.primary.main}22, 0 4px 16px rgba(0,0,0,0.18)`,
          opacity: 0,
          transition: 'opacity 0.28s ease',
          pointerEvents: 'none',
        },
        '&:hover': {
          borderColor: (t) => `${t.palette.primary.main}55`,
        },
        '&:hover::after': { opacity: 1 },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h5"
          component="div"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{
            color: 'primary.main',
            letterSpacing: '0.04em',
            position: 'relative',
            pb: 0.5,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40%',
              height: '2px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, transparent, currentColor, transparent)',
            },
          }}
        >
          {title}
        </Typography>
        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 4, gap: 2 }}>
            <CircularProgress color="primary" size={36} thickness={3.5} />
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.06em' }}>
              메뉴 불러오는 중...
            </Typography>
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            메뉴를 불러오는데 실패했습니다: {error}
          </Alert>
        )}
        {menu && (
          <Box>
            <Typography
              variant="h6"
              component="h3"
              color="text.primary"
              sx={{ fontWeight: "bold", mt: 2 }}
            >
              {menu.title}
            </Typography>
            {(menu.updated_at || menu.created_at) && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {formatDate(menu.updated_at || menu.created_at!)}
                {menu.updated_at &&
                  menu.created_at &&
                  menu.updated_at !== menu.created_at &&
                  " (수정됨)"}
              </Typography>
            )}
            {renderImages()}
            {menu.contents && menu.contents.length > 0 && (
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ mt: 1, whiteSpace: "pre-wrap" }}
              >
                {menu.contents[0].v}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>

      {/* Image Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
            ".swiper-wrapper": {
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1301, 
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            spaceBetween={50}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            keyboard={{ enabled: true }}
            loop
            initialSlide={initialSlide}
            style={{
              '--swiper-navigation-color': '#e4e4e4',
              '--swiper-pagination-color': '#e4e4e4',
            } as React.CSSProperties}
          >
            {allImages.map((imageUrl, index) => (
              <SwiperSlide key={index}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {imageUrl === "combined_donto_view" && menu ? (
                    <DontoMenuView
                      menuImages={dontoMenuImages}
                      menuTitle={menu.title}
                      view="modal"
                    />
                  ) : (
                    <img
                      src={imageUrl}
                      alt={`Expanded view ${index + 1}`}
                      style={modalImageStyle}
                    />
                  )}
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Modal>
    </Card>
  );
}

export default Menu;
