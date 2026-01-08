"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
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
  const [selectedImage, setSelectedImage] = useState("");

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

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedImage("");
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
        {title === "돈토" && menuImages.length === 2 ? (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              borderRadius: 1,
              overflow: "hidden",
              mb: 2,
              cursor: "pointer",
            }}
            onClick={() => handleImageClick("combined_donto_view")}
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
                alt={`${menu.title} menu image 1`}
                style={{
                  width: "160%",
                  height: "auto",
                  display: "block",
                  marginLeft: "-30%",
                }}
              />
            </Box>
            <Box
              sx={{ width: "1px", borderLeft: "1px dashed", borderLeftColor: "text.secondary", flexShrink: 0 }}
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
                alt={`${menu.title} menu image 2`}
                style={{
                  width: "160%",
                  height: "auto",
                  display: "block",
                  marginLeft: "-30%",
                }}
              />
            </Box>
          </Box>
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
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 1,
            display: "flex",
            flexDirection: "column",
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
          {selectedImage === "combined_donto_view" && menu ? (
            (() => {
              const imageMedia = menu.media.filter((m) => m.type === "image");
              const menuImages = imageMedia.slice(0, 2);
              if (menuImages.length < 2) return null;

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
                      alt={`${menu.title} menu image 1`}
                      style={{
                        width: "160%",
                        height: "auto",
                        display: "block",
                        marginLeft: "-30%",
                      }}
                    />
                  </Box>
                  <Box
                    sx={{ width: "2px", borderLeft: "2px dashed", borderLeftColor: "text.secondary", flexShrink: 0 }}
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
                      alt={`${menu.title} menu image 2`}
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
            })()
          ) : (
            selectedImage && (
              <img
                src={selectedImage}
                alt="Expanded menu item"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  objectFit: "contain",
                }}
              />
            )
          )}
        </Box>
      </Modal>
    </Card>
  );
}

export default Menu;
