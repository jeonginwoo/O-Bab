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
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DontoMenuView from "./DontoMenuView";

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
}
interface ApiResponse {
  items: any[];
}

function Menu({ title, apiUrl }: { title: string; apiUrl: string }) {
  const [menu, setMenu] = useState<MenuItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const handleNextImage = useCallback(() => {
    if (allImages.length === 0) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  }, [allImages.length]);

  const handlePrevImage = useCallback(() => {
    if (allImages.length === 0) return;
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length
    );
  }, [allImages.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (openModal) {
        if (event.key === "ArrowLeft") {
          handlePrevImage();
        } else if (event.key === "ArrowRight") {
          handleNextImage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openModal, handlePrevImage, handleNextImage]);

  const handleImageClick = (imageUrl: string) => {
    const index = allImages.indexOf(imageUrl);
    if (index !== -1) {
      setCurrentImageIndex(index);
      setOpenModal(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
            gap: 1,
          }}
        >
          {allImages.length > 1 && (
            <IconButton
              onClick={handlePrevImage}
              sx={{
                bgcolor: "rgba(0,0,0,0.5)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              <ArrowBackIosNewIcon sx={{ color: "white" }} />
            </IconButton>
          )}
          <Box
            sx={{
              position: "relative",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                zIndex: 1,
                position: "absolute",
                right: 14,
                top: 14,
                color: (theme) => theme.palette.grey[500],
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            {(() => {
              const selectedImage = allImages[currentImageIndex];
              if (selectedImage === "combined_donto_view" && menu) {
                const imageMedia = menu.media.filter(
                  (m) => m.type === "image"
                );
                const menuImages = imageMedia.slice(0, 2);
                return (
                  <DontoMenuView
                    menuImages={menuImages}
                    menuTitle={menu.title}
                    view="modal"
                  />
                );
              } else if (selectedImage) {
                return (
                  <img
                    src={selectedImage}
                    alt="Expanded menu item"
                    style={{
                      maxWidth: "80vw",
                      maxHeight: "90vh",
                      objectFit: "contain",
                    }}
                  />
                );
              }
              return null;
            })()}
          </Box>
          {allImages.length > 1 && (
            <IconButton
              onClick={handleNextImage}
              sx={{
                bgcolor: "rgba(0,0,0,0.5)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              <ArrowForwardIosIcon sx={{ color: "white" }} />
            </IconButton>
          )}
        </Box>
      </Modal>
    </Card>
  );
}

export default Menu;
