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
  Tooltip,
  Popover,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DontoMenuView from "./DontoMenuView";
import { classifyMenuImages, type MediaImage } from "../../utils/menuImageDetector";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuIndex, setMenuIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);
  const [modalImageStyle, setModalImageStyle] = useState({});
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLElement | null>(null);
  const [calendarDate, setCalendarDate] = useState(() => new Date());

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
        const items = data.items.filter((item) => !item.pinned);
        if (items.length > 0) {
          setMenuItems(items);
          setMenuIndex(0);
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

  const menu = menuItems.length > 0 ? menuItems[menuIndex] : null;
  const isLatest = menuIndex === 0;
  const hasPrev = menuIndex < menuItems.length - 1;
  const hasNext = menuIndex > 0;

  // 메뉴 날짜 → 인덱스 매핑
  const menuDateMap = React.useMemo(() => {
    const map = new Map<string, number>();
    menuItems.forEach((item, idx) => {
      const ts = item.updated_at || item.created_at;
      if (ts) {
        const d = new Date(ts);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        if (!map.has(key)) map.set(key, idx);
      }
    });
    return map;
  }, [menuItems]);

  const allImages: string[] = React.useMemo(() => {
    if (!menu) return [];
    const imageMedia = menu.media.filter((m) => m.type === "image");
    if (imageMedia.length === 0) return [];

    const { menuImages, foodImages } = classifyMenuImages(imageMedia, title);

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
    return classifyMenuImages(imageMedia, title).menuImages;
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

    const { menuImages, foodImages } = classifyMenuImages(imageMedia, title);

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
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            background: (t: any) => `linear-gradient(90deg, transparent, ${t.palette.primary.main}, transparent)`,
          },
        }}>
          {/* 이전 메뉴 (과거) */}
          <IconButton
            size="small"
            onClick={() => setMenuIndex((i) => i + 1)}
            disabled={!hasPrev}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: hasPrev ? 1 : 0,
              pointerEvents: hasPrev ? 'auto' : 'none',
              transition: 'opacity 0.2s',
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="h5"
            component="div"
            align="center"
            fontWeight="bold"
            onClick={(e) => {
              setCalendarAnchor(e.currentTarget);
              if (menu) {
                const ts = menu.updated_at || menu.created_at;
                if (ts) setCalendarDate(new Date(ts));
              }
            }}
            sx={{
              color: 'primary.main',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': { opacity: 0.7 },
              transition: 'opacity 0.2s',
            }}
          >
            {title}
            <CalendarMonthIcon sx={{ fontSize: '1rem', opacity: 0.5 }} />
          </Typography>

          {/* 달력 팝오버 */}
          <Popover
            open={Boolean(calendarAnchor)}
            anchorEl={calendarAnchor}
            onClose={() => setCalendarAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            slotProps={{ paper: {
              sx: {
                p: 1.5,
                borderRadius: 2,
                minWidth: 260,
              },
            }}}
          >
            {(() => {
              const year = calendarDate.getFullYear();
              const month = calendarDate.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const today = new Date();
              const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
              const selectedTs = menu?.updated_at || menu?.created_at;
              const selectedDate = selectedTs ? new Date(selectedTs) : null;
              const selectedKey = selectedDate
                ? `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`
                : '';

              const days: (number | null)[] = [];
              for (let i = 0; i < firstDay; i++) days.push(null);
              for (let d = 1; d <= daysInMonth; d++) days.push(d);

              return (
                <Box>
                  {/* 월 네비게이션 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <IconButton size="small" onClick={() => setCalendarDate(new Date(year, month - 1, 1))}>
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {year}년 {month + 1}월
                    </Typography>
                    <IconButton size="small" onClick={() => setCalendarDate(new Date(year, month + 1, 1))}>
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* 요일 헤더 */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25, textAlign: 'center', mb: 0.5 }}>
                    {['일','월','화','수','목','금','토'].map((d) => (
                      <Typography key={d} variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.65rem' }}>
                        {d}
                      </Typography>
                    ))}
                  </Box>

                  {/* 날짜 그리드 */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25 }}>
                    {days.map((day, i) => {
                      if (day === null) return <Box key={`e-${i}`} />;
                      const dateKey = `${year}-${month + 1}-${day}`;
                      const hasMenu = menuDateMap.has(dateKey);
                      const isSelected = dateKey === selectedKey;
                      const isToday = dateKey === todayKey;

                      return (
                        <Box
                          key={day}
                          onClick={() => {
                            if (hasMenu) {
                              setMenuIndex(menuDateMap.get(dateKey)!);
                              setCalendarAnchor(null);
                            }
                          }}
                          sx={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            borderRadius: '50%',
                            fontSize: '0.78rem',
                            cursor: hasMenu ? 'pointer' : 'default',
                            fontWeight: isSelected ? 700 : isToday ? 600 : 400,
                            color: hasMenu
                              ? isSelected ? 'primary.contrastText' : 'primary.main'
                              : 'text.disabled',
                            backgroundColor: isSelected
                              ? 'primary.main'
                              : isToday
                                ? (t: any) => `${t.palette.primary.main}15`
                                : 'transparent',
                            border: isToday && !isSelected ? (t: any) => `1px solid ${t.palette.primary.main}44` : 'none',
                            '&:hover': hasMenu && !isSelected ? {
                              backgroundColor: (t: any) => `${t.palette.primary.main}22`,
                            } : {},
                            transition: 'background-color 0.15s',
                          }}
                        >
                          {day}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })()}
          </Popover>

          {/* 다음 메뉴 (최신 방향) + 최근 버튼 */}
          {!isLatest && (
            <Box sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <IconButton
                size="small"
                onClick={() => setMenuIndex(0)}
                sx={{
                  fontSize: '0.65rem',
                  borderRadius: '12px',
                  px: 0.75,
                  py: 0.15,
                  color: 'primary.main',
                  border: (t) => `1px solid ${t.palette.primary.main}44`,
                  '&:hover': {
                    backgroundColor: (t) => `${t.palette.primary.main}11`,
                  },
                }}
              >
                최근
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setMenuIndex((i) => i - 1)}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

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
