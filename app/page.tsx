"use client";

import React, { useState, useEffect } from 'react';
import GameContainer from './components/GameContainer';

import { 
  AppBar, Toolbar, Typography, Container, Card, CardContent, 
  CircularProgress, Alert, Box, ImageList, ImageListItem, useTheme,
  Modal, // Import Modal
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import Close icon


// --- Type definitions (same as before) ---
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

// --- Menu component (refactored with MUI) ---
function Menu({ title, apiUrl }: { title: string; apiUrl:string }) {
  const [menu, setMenu] = useState<MenuItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState(false); // State for modal open/close
  const [selectedImage, setSelectedImage] = useState(''); // State for selected image URL

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        const data: ApiResponse = await response.json();
        const menuItem = data.items.find(item => !item.pinned);
        if (menuItem) {
          setMenu(menuItem);
        } else {
          setError('No available menu found.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
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
    setSelectedImage('');
  };


  const renderImages = () => {
    if (!menu || !menu.media || menu.media.length === 0) return null;

    const imageMedia = menu.media.filter(m => m.type === 'image');
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
      // Default behavior if not Donto or Yuns, or if specific conditions not met
      foodImages = imageMedia;
    }

    return (
      <Box sx={{ mt: 2 }}>
        {menuImages.map((media, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <img
              src={media.url}
              alt={`${menu.title} menu image ${index + 1}`}
              style={{ width: '100%', height: 'auto', borderRadius: 4, cursor: 'pointer' }}
              onClick={() => handleImageClick(media.url)}
            />
          </Box>
        ))}
        {foodImages.length > 0 && (
          <ImageList sx={{ mt: 2 }} cols={3} gap={8}> {/* Removed rowHeight */}
            {foodImages.map((media, index) => (
              <ImageListItem key={index}>
                <img
                  srcSet={`${media.url}?w=164&h=164&fit=crop&auto=format 1x,
                           ${media.url}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                  src={`${media.url}?w=164&h=164&fit=crop&auto=format`}
                  alt={`${menu.title} food image ${index + 1}`}
                  loading="lazy"
                  style={{ borderRadius: 4, cursor: 'pointer' }}
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
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="div" color="secondary" align="center" gutterBottom>
          {title}
        </Typography>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress color="secondary" />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ my: 2 }}>메뉴를 불러오는데 실패했습니다: {error}</Alert>}
        {menu && (
          <Box>
            <Typography variant="h6" component="h3" color="text.primary" sx={{ fontWeight: 'bold', mt: 2 }}> {/* Added mt for spacing */}
              {menu.title}
            </Typography>
            {renderImages()} {/* Moved renderImages to the top */}
            {menu.contents && menu.contents.length > 0 && (
              <Typography variant="body2" color="text.primary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
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
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Expanded menu item" 
              style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 48px)', objectFit: 'contain' }} // Adjust max height for close button
            />
          )}
        </Box>
      </Modal>
    </Card>
  );
}

export default function Home() {
  const dontoUrl = 'https://pf.kakao.com/rocket-web/web/profiles/_xilxcBn/posts?includePinnedPost=true';
  const yunsUrl = 'https://pf.kakao.com/rocket-web/web/profiles/_aKxdLs/posts?includePinnedPost=true';
  const theme = useTheme(); // Access the theme to use its palette colors

  return (
    <Box sx={{ 
      // Removed backgroundColor here, moved to globals.css
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <AppBar position="static" sx={{ backgroundColor: theme.palette.background.paper, borderBottom: `1px solid ${theme.palette.secondary.main}` }}>
        <Toolbar>
          <Typography variant="h4" component="h1" color="secondary" sx={{ flexGrow: 1, textAlign: 'center' }}>
            점심 뭐 먹지?
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        {/* Replicate original flexbox behavior */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: theme.spacing(3), // Equivalent to 24px gap for 8px base spacing
        }}>
          <Box sx={{ flex: '1 1 300px' }}> {/* flex-grow, flex-shrink, flex-basis */}
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%' }}>
                <Menu title="돈토" apiUrl={dontoUrl} />
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%' }}>
                <Menu title="윤스" apiUrl={yunsUrl} />
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%' }}>
                <GameContainer />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      <AppBar position="static" sx={{ backgroundColor: theme.palette.background.paper, mt: 'auto' }}>
        <Toolbar>
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, textAlign: 'center' }}>
            밥밥밥 ver 3.0
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
