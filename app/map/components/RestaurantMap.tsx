"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip, Menu, MenuItem, IconButton, Tooltip, Paper, Divider, Modal } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CloseIcon from '@mui/icons-material/Close';
import { useNaverMap } from '../../hooks/useNaverMap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  menu: string;
  mapUrl?: string;
}

interface RestaurantMarker {
  restaurantId: number;
  marker: naver.maps.Marker;
  infoWindow: naver.maps.InfoWindow;
  originalPosition: naver.maps.LatLng;
}

const sampleRestaurants: Restaurant[] = [
  { id: 1, name: '고기부자집', address: '서울 금천구 가산디지털1로 168 A동 B119호', menu: '육류,고기요리', mapUrl: 'https://map.naver.com/p/entry/place/1670660666?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603091320&locale=ko&svcName=map_pcv5' },
  { id: 2, name: '양원집 가산디지털단지점', address: '서울 금천구 가산디지털1로 168 우림라이온스밸리 A동 207호', menu: '양갈비', mapUrl: "https://map.naver.com/p/entry/place/1005368159?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603091326&locale=ko&svcName=map_pcv5" },
  { id: 3, name: '서울식당', address: '서울 금천구 가산디지털1로 168 우림라이온스밸리1차 A동 2층', menu: '한식', mapUrl: "https://map.naver.com/p/entry/place/1286557957?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603091347&locale=ko&svcName=map_pcv5" },
  { id: 4, name: '양은이네 가산직영점', address: '서울 금천구 가산디지털1로 168 우림라이온스밸리 A동 2층 205호', menu: '한식', mapUrl: "https://map.naver.com/p/entry/place/1391481694?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603091348&locale=ko&svcName=map_pcv5" },
  { id: 5, name: '가산 마포갈매기', address: '서울 금천구 벚꽃로 298 대륭포스트타워 6차 B1층(지하) 104호', menu: '육류,고기요리', mapUrl: "https://map.naver.com/p/entry/place/1403999050?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603091349&locale=ko&svcName=map_pcv5" },
  { id: 6, name: '여장군 가산점', address: '서울 금천구 가산디지털1로 142 더스카이밸리 2층 220호', menu: '육류,고기요리', mapUrl: "https://map.naver.com/p/entry/place/1733685335?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603091349&locale=ko&svcName=map_pcv5" },
  { id: 7, name: '오리오리 가산디지털단지점', address: '서울 금천구 가산디지털1로 186 제이플라츠 지하1층 B130호', menu: '오리요리', mapUrl: "https://map.naver.com/p/entry/place/1508800766?c=16.00,0,0,0,dh&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603091350&locale=ko&svcName=map_pcv5" },
  { id: 8, name: '민락양꼬치👍', address: '경기 의정부시 오목로225번길 16-4 1층', menu: '양꼬치', mapUrl: "https://map.naver.com/p/entry/place/1887883027?c=15.00,0,0,0,dh&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603091351&locale=ko&svcName=map_pcv5" },
  { id: 9, name: '더낙원램양꼬치', address: '서울 관악구 남부순환로151길 78 1층', menu: '양꼬치', mapUrl: "https://map.naver.com/p/entry/place/1683527716?c=15.00,0,0,0,dh&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603091352&locale=ko&svcName=map_pcv5" },
  { id: 10, name: '먹거리곱창', address: '서울 성북구 정릉로21길 71 1층', menu: '곱창,막창,양', mapUrl: "https://map.naver.com/p/entry/place/1278152415?c=15.00,0,0,0,dh&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603091352&locale=ko&svcName=map_pcv5" },
  { id: 11, name: '천막집', address: '서울 성북구 보문로30길 31 1층 천막집', menu: '요리주점', mapUrl: "https://map.naver.com/p/entry/place/1502574317?c=15.00,0,0,0,dh&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202603091353&locale=ko&svcName=map_pcv5" },
];

const RestaurantChip = ({ 
  restaurant, 
  isSelected, 
  onClick 
}: { 
  restaurant: Restaurant; 
  isSelected: boolean; 
  onClick: () => void; 
}) => (
  <Chip
    label={
      <span>
        {restaurant.name}{" "}
        <span style={{ fontSize: "0.85em", opacity: 0.6 }}>
          ({restaurant.menu})
        </span>
      </span>
    }
    onClick={onClick}
    color={isSelected ? "primary" : "default"}
    variant={isSelected ? "filled" : "outlined"}
    clickable
  />
);

const RestaurantMap = () => {
  const { isLoaded, error } = useNaverMap();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const chipsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isUserMenuMode, setIsUserMenuMode] = useState(false); // User preference
  const [mobileAnchorEl, setMobileAnchorEl] = useState<null | HTMLElement>(null);
  
  // Changed type to HTMLElement to support Chip
  const isMobileMenuOpen = Boolean(mobileAnchorEl);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const markersRef = useRef<RestaurantMarker[]>([]);
  const initialMapCenterRef = useRef<naver.maps.LatLng | null>(null);

  // Image slider modal state
  const [openImageModal, setOpenImageModal] = useState(false);
  const [imageModalSlide, setImageModalSlide] = useState(0);

  // Dynamically fetched images
  const [imageCache, setImageCache] = useState<Record<number, string[]>>({});
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const fetchedIdsRef = useRef<Set<number>>(new Set());

  // Paginated image rendering
  const [visibleImageCount, setVisibleImageCount] = useState(9);

  const handleImageClick = (idx: number) => {
    setImageModalSlide(idx);
    setOpenImageModal(true);
  };

  const handleCloseImageModal = () => {
    setOpenImageModal(false);
  };

  const handleGridScroll = (e: React.UIEvent<HTMLDivElement>, totalCount: number) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) {
      setVisibleImageCount(prev => Math.min(prev + 9, totalCount));
    }
  };

  const toggleViewMode = () => {
    setIsUserMenuMode((prev) => !prev);
  }

  useEffect(() => {
    // Initial auto-detection: if content is large, switch to menu mode by default.
    // We use a one-time observer to detect initial overflow.
    const observer = new ResizeObserver(() => {
        if (chipsContainerRef.current) {
             const height = chipsContainerRef.current.offsetHeight;
             // If height > 110 (approx 2 lines), auto-enable menu mode initially
             if (height > 110) {
                 setIsUserMenuMode(true);
                 observer.disconnect(); // Only auto-switch once on load
             }
        }
    });

    if (chipsContainerRef.current) {
      observer.observe(chipsContainerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Initialize map and markers
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) {
      return;
    }

    // Define initial map center
    initialMapCenterRef.current = new window.naver.maps.LatLng(37.477956675, 126.881596144);

    // 1. Create Map instance
    const mapInstance = new window.naver.maps.Map(mapRef.current, {
      center: initialMapCenterRef.current,
      zoom: 17,
    });
    setMap(mapInstance);

    // Add '프로텐' marker at the center
    new window.naver.maps.Marker({
      position: mapInstance.getCenter(),
      map: mapInstance,
      title: '프로텐',
      icon: {
        url: '/proten.png',
        size: new window.naver.maps.Size(50, 50),      // 1. 마커가 보여질 영역의 크기
        scaledSize: new window.naver.maps.Size(50, 50), // 2. 실제 이미지의 크기 (이게 있어야 리사이징 됨)
        origin: new window.naver.maps.Point(0, 0),
        anchor: new window.naver.maps.Point(25, 50)     // 3. 이미지의 하단 중앙이 좌표에 오도록 설정 (가로/2, 세로)
      },
    });

    // 2. Geocode and create markers
    sampleRestaurants.forEach((restaurant) => {
      if (!window.naver.maps.Service) {
        console.error("Naver Maps Service is not available.");
        return;
      }
      naver.maps.Service.geocode({ query: restaurant.address }, (status, response) => {
        if (status !== naver.maps.Service.Status.OK || !response.v2.addresses.length) {
          console.error('Geocoding error for:', restaurant.address);
          return;
        }

        const coords = response.v2.addresses[0];
        const point = new naver.maps.LatLng(parseFloat(coords.y), parseFloat(coords.x));

        let finalPosition = point;
        const sameLocMarkers = markersRef.current.filter(m => 
            m.originalPosition.equals(point)
        );

        if (sameLocMarkers.length > 0) {
            const spacing = 0.0002;
            const offsetIdx = sameLocMarkers.length;
            const theta = offsetIdx * 2.4; // Approx 137.5 degrees
            const r = spacing * (1 + 0.1 * offsetIdx); 
            
            const lat = parseFloat(coords.y) + r * Math.sin(theta);
            const lng = parseFloat(coords.x) + r * Math.cos(theta);
            finalPosition = new naver.maps.LatLng(lat, lng);
        }

        const marker = new naver.maps.Marker({ position: finalPosition, map: mapInstance, title: restaurant.name });
        const naverMapSearchUrl = restaurant.mapUrl ?? `https://map.naver.com/v5/search/${encodeURIComponent(restaurant.address)}`;

        const contentEl = document.createElement("div");
        contentEl.style.cssText = "padding: 10px; min-width: 200px; max-width: calc(100vw - 40px); width: 260px; line-height: 1.5; color: #000; position: relative; word-break: break-word; box-sizing: border-box;";

        contentEl.innerHTML = `
          <h4 style="margin: 0 0 5px 0; padding-right: 20px;">
            <a href="${naverMapSearchUrl}" target="_blank" rel="noopener noreferrer" style="color: #03a9f4; text-decoration: underline;">${restaurant.name}</a>
          </h4>
          <p style="margin: 0; color: #333;">${restaurant.address}</p>
          <p style="margin: 0; color: #977162;">${restaurant.menu}</p>
        `;

        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&#x2715;";
        closeBtn.style.cssText = "position: absolute; top: 0px; right: 0px; border: none; background: transparent; cursor: pointer; font-size: 18px; color: #888; padding: 5px; line-height: 1;";
        closeBtn.type = "button";
        contentEl.appendChild(closeBtn);

        const infoWindow = new naver.maps.InfoWindow({
          content: contentEl,
          maxWidth: 300,
          borderWidth: 0,
        });

        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          infoWindow.close();
        });

        markersRef.current.push({ restaurantId: restaurant.id, marker, infoWindow, originalPosition: point });

        naver.maps.Event.addListener(marker, 'click', () => {
          markersRef.current.forEach(m => m.infoWindow.close());
          infoWindow.open(mapInstance, marker);
          setSelectedRestaurant(restaurant);
          mapInstance.panTo(finalPosition);
        });
      });
    });
  }, [isLoaded, map]);

  useEffect(() => {
    if (!selectedRestaurant) return;
    const businessId = selectedRestaurant.mapUrl?.match(/\/place\/(\d+)/)?.[1];
    if (!businessId || fetchedIdsRef.current.has(selectedRestaurant.id)) return;
    fetchedIdsRef.current.add(selectedRestaurant.id);
    const id = selectedRestaurant.id;
    setImageLoading(prev => ({ ...prev, [id]: true }));
    fetch(`/api/naver-photos?businessId=${businessId}`)
      .then(res => res.json())
      .then(data => setImageCache(prev => ({ ...prev, [id]: data.photos ?? [] })))
      .catch(() => setImageCache(prev => ({ ...prev, [id]: [] })))
      .finally(() => setImageLoading(prev => ({ ...prev, [id]: false })));
  }, [selectedRestaurant?.id]);

  useEffect(() => {
    setVisibleImageCount(9);
  }, [selectedRestaurant?.id]);

  const handleListItemClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    if (!map) return;
    const restaurantMarker = markersRef.current.find(m => m.restaurantId === restaurant.id);
    if (restaurantMarker) {
      map.panTo(restaurantMarker.marker.getPosition());
      markersRef.current.forEach(m => m.infoWindow.close());
      restaurantMarker.infoWindow.open(map, restaurantMarker.marker);
    }
  };

  const handleCenterMap = () => {
    setSelectedRestaurant(null);
    if (map && initialMapCenterRef.current) {
      map.setCenter(initialMapCenterRef.current);
      map.setZoom(17);
    }
  };

  const handleMobileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMobileAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const handleMobileSelect = (r: Restaurant) => {
    handleListItemClick(r);
    handleMobileMenuClose();
  };

  if (error) return <Alert severity="error">지도를 불러오는데 실패했습니다: {error.message}</Alert>;
  if (!isLoaded) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /><Typography sx={{ ml: 2 }}>지도 로딩 중...</Typography></Box>;

  const naverMapSearchUrl = selectedRestaurant
    ? (selectedRestaurant.mapUrl ?? `https://map.naver.com/v5/search/${encodeURIComponent(selectedRestaurant.address)}`)
    : '';
  const currentImages = selectedRestaurant ? (imageCache[selectedRestaurant.id] ?? []) : [];
  const isImagesLoading = selectedRestaurant ? (imageLoading[selectedRestaurant.id] ?? false) : false;
  
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
       {/* Removed separate toggle button bar */}
      <Box sx={{ position: 'relative', width: '100%', flexShrink: 0 }}>
        {/* Chips Container - Rendered when NOT in menu mode */}
        {!isUserMenuMode && (
        <div 
          ref={chipsContainerRef}
          style={{ 
            padding: '16px', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Chip
            label="프로텐"
            onClick={handleCenterMap}
            clickable
            color="secondary"
            variant="filled"
          />
          <Tooltip title="간략히 보기">
            <Chip
               label={<ViewListIcon sx={{ display: 'block' }} />}
               onClick={toggleViewMode}
               clickable
               variant="filled"
               color="info"
               sx={{ '& .MuiChip-label': { px: 1 } }}
            />
          </Tooltip>
          {sampleRestaurants.map((r) => (
            <RestaurantChip
              key={r.id}
              restaurant={r}
              isSelected={selectedRestaurant?.id === r.id}
              onClick={() => handleListItemClick(r)}
            />
          ))}
        </div>
        )}

        {/* Menu View - Visible only when in menu mode */}
        {isUserMenuMode && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, overflowX: "auto", whiteSpace: "nowrap", width: '100%' }}>
            <Chip
              label="프로텐"
              onClick={handleCenterMap}
              clickable
              color="secondary"
              variant="filled"
            />
            <Tooltip title="펼쳐 보기">
              <Chip
                   label={<ViewModuleIcon sx={{ display: 'block' }} />}
                   onClick={toggleViewMode}
                   clickable
                   variant="filled"
                   color="info"
                   sx={{ '& .MuiChip-label': { px: 1 } }}
              />
            </Tooltip>
            <Chip
                label="식당 선택" 
                onClick={handleMobileMenuClick} 
                icon={<MenuIcon />} 
                clickable 
                variant="outlined"
            />
            {selectedRestaurant && (
               <Chip
                label={
                  <span>
                    {selectedRestaurant.name}{" "}
                    <span style={{ fontSize: "0.85em", opacity: 0.6 }}>
                      ({selectedRestaurant.menu})
                    </span>
                  </span>
                }
                color="primary"
               />
            )}
            <Menu
              anchorEl={mobileAnchorEl}
              open={isMobileMenuOpen}
              onClose={handleMobileMenuClose}
              PaperProps={{
                style: {
                  maxHeight: "60vh",
                  maxWidth: "90vw",
                },
              }}
            >
              <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: 600, maxHeight: 600 }}>
                {sampleRestaurants.map((r) => (
                  <RestaurantChip
                    key={r.id}
                    restaurant={r}
                    isSelected={selectedRestaurant?.id === r.id}
                    onClick={() => handleMobileSelect(r)}
                  />
                ))}
              </Box>
            </Menu>
          </Box>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, width: '100%', position: 'relative' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
      </Box>

      {/* Restaurant detail popup – anchored to bottom-right of the card */}
      {selectedRestaurant && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: { xs: 'calc(100% - 32px)', sm: 320 },
            zIndex: 10,
            p: 2,
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
            <Typography
              component="a"
              href={naverMapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#03a9f4', textDecoration: 'underline', lineHeight: 1.3, pr: 1 }}
            >
              {selectedRestaurant.name}
            </Typography>
            <IconButton size="small" onClick={() => setSelectedRestaurant(null)} sx={{ mt: -0.5, mr: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {selectedRestaurant.address}
          </Typography>
          <Typography variant="body2" sx={{ color: '#977162', mb: (isImagesLoading || currentImages.length > 0) ? 1.5 : 0 }}>
            {selectedRestaurant.menu}
          </Typography>

          {/* Image grid */}
          {(isImagesLoading || currentImages.length > 0) && (
            <>
              <Divider sx={{ mb: 1.5 }} />
              {isImagesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
              <Box
                onScroll={(e) => handleGridScroll(e, currentImages.length)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 0.5,
                  maxHeight: '28vh',
                  overflowY: 'scroll',
                  mr: -2,
                  pr: 1.5,
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-button': { display: 'none', height: 0 },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.25)', borderRadius: '4px' },
                  '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(0,0,0,0.45)' },
                }}
              >
                {currentImages.slice(0, visibleImageCount).map((url, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={url}
                    alt={`${selectedRestaurant.name} 사진 ${idx + 1}`}
                    onClick={() => handleImageClick(idx)}
                    sx={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 0.8 },
                    }}
                  />
                ))}
              </Box>
              )}
            </>
          )}
        </Paper>
      )}

      {/* Image Slider Modal */}
      <Modal
        open={openImageModal}
        onClose={handleCloseImageModal}
        aria-labelledby="restaurant-image-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            height: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            '.swiper-wrapper': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseImageModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1301,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          {openImageModal && currentImages.length > 0 && (
            <Swiper
              modules={[Navigation, Pagination, Keyboard]}
              spaceBetween={50}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              keyboard={{ enabled: true }}
              loop
              initialSlide={imageModalSlide}
              style={{
                width: '100%',
                height: '100%',
                '--swiper-navigation-color': '#e4e4e4',
                '--swiper-pagination-color': '#e4e4e4',
              } as React.CSSProperties}
            >
              {currentImages.map((url, idx) => (
                <SwiperSlide key={idx}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <img
                      src={url}
                      alt={`${selectedRestaurant?.name} 사진 ${idx + 1}`}
                      style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default RestaurantMap;
