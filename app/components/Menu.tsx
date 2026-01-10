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
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Media {
  type: string;
  url: string;
}
interface Content {
  t: string;
  v: string;
}
interface MenuItem {
  title: string;
  contents: Content[];
  media: Media[];
  created_at?: number;
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

    if (title === "돈토") {
      const foodImages = imageMedia.slice(2);
      const foodImagesSrc = foodImages.map((m) => m.url);
      return ["combined_donto_view", ...foodImagesSrc];
    } else if (title === "윤스") {
      if (imageMedia.length > 0) {
        const menuImages = [imageMedia[imageMedia.length - 1]];
        const foodImages = imageMedia.slice(0, imageMedia.length - 1);
        const menuImagesSrc = menuImages.map((m) => m.url);
        const foodImagesSrc = foodImages.map((m) => m.url);
        return [...menuImagesSrc, ...foodImagesSrc];
      } else {
        return [];
      }
    } else {
      return imageMedia.map((m) => m.url);
    }
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

    if (title === "돈토") {
      menuImages = imageMedia.slice(0, 2);
      foodImages = imageMedia.slice(2);
    } else if (title === "윤스") {
      if (imageMedia.length > 0) {
        menuImages = [imageMedia[imageMedia.length - 1]];
        foodImages = imageMedia.slice(0, imageMedia.length - 1);
      }
    } else {
      foodImages = imageMedia;
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
            <Box key={index} sx={{ mb: 2 }}>
              <img
                src={media.url}
                alt={`${menu.title} menu image ${index + 1}`}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                onClick={() => handleImageClick(media.url)}
              />
            </Box>
          ))
        )}
        {foodImages.length > 0 && (
          <ImageList sx={{ mt: 2 }} cols={3} gap={8}>
            {foodImages.map((media, index) => (
              <ImageListItem key={index}>
                <img
                  src={media.url}
                  alt={`${menu.title} food image ${index + 1}`}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                  onClick={() => handleImageClick(media.url)}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Box>
    );
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h5"
          component="div"
          color="secondary"
          align="center"
          gutterBottom
        >
          {title}
        </Typography>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress color="secondary" />
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
            {menu.created_at && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatDate(menu.created_at)}
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
            width: "auto",
            maxWidth: "95vw",
            maxHeight: "95vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
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
            initialSlide={initialSlide}
            style={{
              '--swiper-navigation-color': '#fff',
              '--swiper-pagination-color': '#fff',
            } as React.CSSProperties}
          >
            {allImages.map((imageUrl, index) => (
              <SwiperSlide key={index}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '95vh',
                }}>
                  {imageUrl === "combined_donto_view" && menu ? (
                    <DontoMenuView
                      menuImages={menu.media.filter(m => m.type === 'image').slice(0, 2)}
                      menuTitle={menu.title}
                      view="modal"
                    />
                  ) : (
                    <img
                      src={imageUrl}
                      alt={`Expanded view ${index + 1}`}
                      style={{
                        maxWidth: "90vw",
                        maxHeight: "90vh",
                        objectFit: "contain",
                      }}
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
