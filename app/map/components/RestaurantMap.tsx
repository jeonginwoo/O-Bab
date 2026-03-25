"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip, Menu, MenuItem, IconButton, Tooltip, Paper, Divider, Modal } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useNaverMap } from '../../hooks/useNaverMap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Restaurant {
  place_id: string;
  name: string;
  address?: string;
  category?: string;
  mapUrl?: string;
  phone?: string;
  score?: string;
  reviewsCount?: string;
  conveniences?: string[];
  microReviews?: string[];
}

interface RestaurantMarker {
  restaurantId: string;
  marker: naver.maps.Marker;
  infoWindow: naver.maps.InfoWindow;
  originalPosition: naver.maps.LatLng;
  contentEl: HTMLDivElement;
}

const sampleRestaurants: Restaurant[] = [
  { place_id: '1670660666', name: '고기부자집' },
  { place_id: '1005368159', name: '양원집 가산디지털단지점' },
  { place_id: '1286557957', name: '서울식당' },
  { place_id: '1391481694', name: '양은이네 가산직영점' },
  { place_id: '1403999050', name: '가산 마포갈매기' },
  { place_id: '1733685335', name: '여장군 가산점' },
  { place_id: '1508800766', name: '오리오리 가산디지털단지점' },
  { place_id: '1560761793', name: '보배반점' },
  { place_id: '1659037504', name: '오키소바' },
  { place_id: '1335927402', name: '고칸 가산점' },
  { place_id: '1887883027', name: '민락양꼬치👍' },
  { place_id: '1683527716', name: '더낙원램양꼬치' },
  { place_id: '1278152415', name: '먹거리곱창' },
  { place_id: '1502574317', name: '천막집' },
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
          ({restaurant.category})
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
  const theme = useTheme();
  const { isLoaded, error } = useNaverMap();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const chipsContainerRef = useRef<HTMLDivElement>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
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
  const [imageCache, setImageCache] = useState<Record<string, string[]>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const fetchedIdsRef = useRef<Set<string>>(new Set());

  // Paginated image rendering
  const [visibleImageCount, setVisibleImageCount] = useState(9);

  useEffect(() => {
    const fetchInfo = async () => {
      const updated = await Promise.all(
        sampleRestaurants.map(async (r) => {
          try {
            const res = await fetch(`/api/place-info?placeId=${r.place_id}`);
            if (res.ok) {
              const data = await res.json();
              return {
                ...r,
                address: data.address || '',
                category: data.category || '',
                phone: data.phone || '',
                score: data.score || '',
                reviewsCount: data.reviewsCount || '',
                conveniences: data.conveniences || [],
                microReviews: data.microReviews || [],
                mapUrl: `https://map.naver.com/v5/entry/place/${r.place_id}?c=15.00,0,0,0,dh`,
              };
            }
          } catch (e) {
            console.error('Failed to fetch info for', r.name);
          }
          return r;
        })
      );
      setRestaurants(updated);
    };
    fetchInfo();
  }, []);

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
    if (!isLoaded || !mapRef.current || map || restaurants.length === 0 || !restaurants[0].address) {
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
    restaurants.forEach((restaurant) => {
      if (!window.naver.maps.Service || !restaurant.address) {
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
        const naverMapSearchUrl = restaurant.mapUrl ?? `https://map.naver.com/v5/search/${encodeURIComponent(restaurant.address ?? '')}`;

        const { palette } = theme;
        const contentEl = document.createElement("div");
        contentEl.style.cssText = `padding: 10px; min-width: 200px; max-width: calc(100vw - 40px); width: 260px; line-height: 1.5; color: ${palette.text.primary}; background-color: ${palette.background.paper}; position: relative; word-break: break-word; box-sizing: border-box;`;

        contentEl.innerHTML = `
          <h4 style="margin: 0 0 5px 0; padding-right: 20px;">
            <a href="${naverMapSearchUrl}" target="_blank" rel="noopener noreferrer" class="info-link" style="color: ${palette.primary.main}; text-decoration: underline;">${restaurant.name}</a>
            ${restaurant.category ? `<span class="info-category" style="font-size: 0.8em; opacity: 0.7; color: ${palette.text.secondary}; font-weight: normal; margin-left: 4px;">${restaurant.category}</span>` : ''}
          </h4>
          <p class="info-address" style="font-size: 0.8em; margin: 0 0 2px 0; color: ${palette.text.secondary};">${restaurant.address || ''}</p>
        `;

        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&#x2715;";
        closeBtn.style.cssText = `position: absolute; top: 0px; right: 0px; border: none; background: transparent; cursor: pointer; font-size: 18px; color: ${palette.text.secondary}; padding: 5px; line-height: 1;`;
        closeBtn.type = "button";
        contentEl.appendChild(closeBtn);

        const infoWindow = new naver.maps.InfoWindow({
          content: contentEl,
          maxWidth: 300,
          borderWidth: 0,
          backgroundColor: palette.background.paper,
          borderColor: palette.background.paper,
          anchorColor: palette.background.paper,
        });

        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          infoWindow.close();
        });

        markersRef.current.push({ restaurantId: restaurant.place_id, marker, infoWindow, originalPosition: point, contentEl });

        naver.maps.Event.addListener(marker, 'click', () => {
          markersRef.current.forEach(m => m.infoWindow.close());
          infoWindow.open(mapInstance, marker);
          setSelectedRestaurant(restaurant);
          mapInstance.panTo(finalPosition);
        });
      });
    });
  }, [isLoaded, map, restaurants]);

  useEffect(() => {
    if (!selectedRestaurant) return;
    const businessId = selectedRestaurant.place_id;
    if (!businessId || fetchedIdsRef.current.has(businessId)) return;
    fetchedIdsRef.current.add(businessId);
    setImageLoading(prev => ({ ...prev, [businessId]: true }));
    fetch(`/api/naver-photos?businessId=${businessId}`)
      .then(res => res.json())
      .then(data => setImageCache(prev => ({ ...prev, [businessId]: data.photos ?? [] })))
      .catch(() => setImageCache(prev => ({ ...prev, [businessId]: [] })))
      .finally(() => setImageLoading(prev => ({ ...prev, [businessId]: false })));
  }, [selectedRestaurant?.place_id]);

  useEffect(() => {
    setVisibleImageCount(9);
  }, [selectedRestaurant?.place_id]);

  // Update InfoWindow colors when theme changes
  useEffect(() => {
    if (markersRef.current.length === 0) return;
    const { palette } = theme;
    markersRef.current.forEach(({ contentEl, infoWindow }) => {
      contentEl.style.color = palette.text.primary;
      contentEl.style.backgroundColor = palette.background.paper;
      const link = contentEl.querySelector('.info-link') as HTMLAnchorElement | null;
      if (link) link.style.color = palette.primary.main;
      const category = contentEl.querySelector('.info-category') as HTMLElement | null;
      if (category) category.style.color = palette.text.secondary;
      const address = contentEl.querySelector('.info-address') as HTMLElement | null;
      if (address) address.style.color = palette.text.secondary;
      const closeBtn = contentEl.querySelector('button') as HTMLButtonElement | null;
      if (closeBtn) closeBtn.style.color = palette.text.secondary;
      infoWindow.setOptions({ content: contentEl, backgroundColor: palette.background.paper, borderColor: palette.background.paper, anchorColor: palette.background.paper });
    });
  }, [theme]);

  const handleListItemClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    if (!map) return;
    const restaurantMarker = markersRef.current.find(m => m.restaurantId === restaurant.place_id);
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
    ? (selectedRestaurant.mapUrl ?? `https://map.naver.com/v5/search/${encodeURIComponent(selectedRestaurant.address ?? '')}`)
    : '';
  const currentImages = selectedRestaurant ? (imageCache[selectedRestaurant.place_id] ?? []) : [];
  const isImagesLoading = selectedRestaurant ? (imageLoading[selectedRestaurant.place_id] ?? false) : false;
  
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
          {restaurants.map((r) => (
            <RestaurantChip
              key={r.place_id}
              restaurant={r}
              isSelected={selectedRestaurant?.place_id === r.place_id}
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
                      ({selectedRestaurant.category})
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
                {restaurants.map((r) => (
                  <RestaurantChip
                    key={r.place_id}
                    restaurant={r}
                    isSelected={selectedRestaurant?.place_id === r.place_id}
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
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, pr: 1 }}>
              <Box
                component="a"
                href={naverMapSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'primary.main', textDecoration: 'underline' }}
              >
                {selectedRestaurant.name}
              </Box>
              {selectedRestaurant.category && (
                <Box component="span" sx={{ fontSize: '0.85em', opacity: 0.8, color: 'text.secondary', fontWeight: 'normal', ml: 1, textDecoration: 'none' }}>
                  {selectedRestaurant.category}
                </Box>
              )}
            </Typography>
            <IconButton size="small" onClick={() => setSelectedRestaurant(null)} sx={{ mt: -0.5, mr: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {selectedRestaurant.address}
          </Typography>

          {(selectedRestaurant.phone || selectedRestaurant.score || (selectedRestaurant.microReviews && selectedRestaurant.microReviews.length > 0) || (selectedRestaurant.conveniences && selectedRestaurant.conveniences.length > 0)) && (
            <Box sx={{ mb: (isImagesLoading || currentImages.length > 0) ? 1.5 : 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {(selectedRestaurant.score || selectedRestaurant.phone) && (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem', display: 'inline-block' }}>
                  {selectedRestaurant.score && (
                    <Box component="span" sx={{ mr: 1.5 }}>
                      ⭐ {selectedRestaurant.score} <Box component="span" sx={{ fontSize: '0.85em', opacity: 0.8 }}>(리뷰 {selectedRestaurant.reviewsCount})</Box>
                    </Box>
                  )}
                  {selectedRestaurant.phone && (
                    <Box component="span">
                      📞 {selectedRestaurant.phone}
                    </Box>
                  )}
                </Typography>
              )}
              {selectedRestaurant.microReviews && selectedRestaurant.microReviews.length > 0 && (
                 <Typography variant="body2" sx={{ color: 'success.main', fontSize: '0.85rem', mt: 0.5, fontStyle: 'italic' }}>
                   &quot;{selectedRestaurant.microReviews[0]}&quot;
                 </Typography>
              )}
              {selectedRestaurant.conveniences && selectedRestaurant.conveniences.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {selectedRestaurant.conveniences.map((conv, idx) => (
                    <Chip
                      key={idx}
                      label={conv}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem', height: '20px' }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}

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
