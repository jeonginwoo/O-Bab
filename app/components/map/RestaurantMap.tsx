"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip, Button, Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNaverMap } from '../../hooks/useNaverMap';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  menu: string;
}

interface RestaurantMarker {
  restaurantId: number;
  marker: naver.maps.Marker;
  infoWindow: naver.maps.InfoWindow;
}

const sampleRestaurants: Restaurant[] = [
  { id: 1, name: '고기부자집', address: '서울 금천구 가산디지털1로 168 A동 B119호', menu: '육류,고기요리' },
  { id: 2, name: '양원집 가산디지털단지점', address: '서울 금천구 가산디지털1로 168 우림라이온스밸리 A동 207호', menu: '양갈비' },
  { id: 3, name: '서울식당', address: '서울 금천구 가산디지털1로 168 우림라이온스밸리1차 A동 2층', menu: '한식' },
  { id: 4, name: '양은이네 가산직영점', address: '서울 금천구 가산디지털1로 168 우림라이온스밸리 A동 2층 205호', menu: '한식' },
  { id: 5, name: '가산 마포갈매기', address: '서울 금천구 벚꽃로 298 대륭포스트타워 6차 B1층(지하) 104호', menu: '육류,고기요리' },
  { id: 6, name: '여장군 가산점', address: '서울 금천구 가산디지털1로 142 더스카이밸리 2층 220호', menu: '육류,고기요리' },
  { id: 7, name: '오리오리 가산디지털단지점', address: '서울 금천구 가산디지털1로 186 제이플라츠 지하1층 B130호', menu: '오리요리' },
  { id: 8, name: '민락양꼬치👍', address: '경기 의정부시 오목로225번길 16-4 1층', menu: '양꼬치' },
  { id: 9, name: '더낙원램양꼬치', address: '서울 관악구 남부순환로151길 78 1층', menu: '양꼬치' },
  { id: 10, name: '먹거리곱창', address: '서울 성북구 정릉로21길 71 1층', menu: '곱창,막창,양' },
  { id: 11, name: '천막집', address: '서울 성북구 보문로30길 31 1층 천막집', menu: '요리주점' },
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
    color={isSelected ? "secondary" : "default"}
    variant={isSelected ? "filled" : "outlined"}
    clickable
  />
);

const RestaurantMap = () => {
  const { isLoaded, error } = useNaverMap();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const chipsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isMenuMode, setIsMenuMode] = useState(false);
  const [isUserMenuMode, setIsUserMenuMode] = useState(false); // User preference
  const [mobileAnchorEl, setMobileAnchorEl] = useState<null | HTMLElement>(null);
  
  // Changed type to HTMLElement to support Chip
  const isMobileMenuOpen = Boolean(mobileAnchorEl);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const markersRef = useRef<RestaurantMarker[]>([]);
  const initialMapCenterRef = useRef<naver.maps.LatLng | null>(null);

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

        const marker = new naver.maps.Marker({ position: point, map: mapInstance, title: restaurant.name });
        const naverMapSearchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(restaurant.address + " " + restaurant.name)}`;
        
        const contentEl = document.createElement("div");
        contentEl.style.cssText = "padding: 10px; min-width: 200px; line-height: 1.5; color: #000; position: relative;";
        
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
        });

        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            infoWindow.close();
        });

        markersRef.current.push({ restaurantId: restaurant.id, marker, infoWindow });

        naver.maps.Event.addListener(marker, 'click', () => {
          markersRef.current.forEach(m => m.infoWindow.close());
          infoWindow.open(mapInstance, marker);
          setSelectedRestaurant(restaurant);
        });
      });
    });
  }, [isLoaded, map]);
  
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
      map.setZoom(17); // Reset zoom to initial level if needed
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
  
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
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
            color="primary"
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
              color="primary"
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
                color="secondary"
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
    </Box>
  );
};

export default RestaurantMap;
