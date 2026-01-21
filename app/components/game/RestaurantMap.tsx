"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip, Button } from '@mui/material';
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
  { id: 1, name: '고기부자집', address: '서울 금천구 가산동 371-28', menu: '육류,고기요리' },
  { id: 2, name: '가산 마포갈매기', address: '서울 금천구 가산동 50-3', menu: '육류,고기요리' },
  { id: 3, name: '양원집 가산디지털단지점', address: '서울 금천구 가산동 371-28', menu: '양갈비' },
  { id: 4, name: '여장군 가산점', address: '서울 금천구 가산동 371-57', menu: '육류,고기요리' },
  { id: 5, name: '서울식당', address: '서울 금천구 가산동 371-28', menu: '한식' },
  { id: 6, name: '양은이네 가산직영점', address: '서울 금천구 가산동 371-28', menu: '한식' },
  { id: 7, name: '오리오리 가산디지털단지점', address: '서울 금천구 가산동 459-11', menu: '오리요리' },
];



const RestaurantMap = () => {
  const { isLoaded, error } = useNaverMap();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const markersRef = useRef<RestaurantMarker[]>([]);
  const initialMapCenterRef = useRef<naver.maps.LatLng | null>(null);

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
        const naverMapSearchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(restaurant.name)}`;
        const infoWindow = new naver.maps.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 200px; line-height: 1.5;">
              <h4 style="margin: 0 0 5px 0;">
                <a href="${naverMapSearchUrl}" target="_blank" rel="noopener noreferrer">${restaurant.name}</a>
              </h4>
              <p style="margin: 0;">${restaurant.menu}</p>
            </div>
          `,
        });

        markersRef.current.push({ restaurantId: restaurant.id, marker, infoWindow });

        naver.maps.Event.addListener(marker, 'click', () => {
          markersRef.current.forEach(m => m.infoWindow.close());
          infoWindow.open(mapInstance, marker);
        });
      });
    });
  }, [isLoaded, map]);
  
  const handleListItemClick = (restaurant: Restaurant) => {
    if (!map) return;
    const restaurantMarker = markersRef.current.find(m => m.restaurantId === restaurant.id);
    if (restaurantMarker) {
      map.panTo(restaurantMarker.marker.getPosition());
      markersRef.current.forEach(m => m.infoWindow.close());
      restaurantMarker.infoWindow.open(map, restaurantMarker.marker);
    }
  };

  const handleCenterMap = () => {
    if (map && initialMapCenterRef.current) {
      map.setCenter(initialMapCenterRef.current);
      map.setZoom(17); // Reset zoom to initial level if needed
    }
  };

  if (error) return <Alert severity="error">지도를 불러오는데 실패했습니다: {error.message}</Alert>;
  if (!isLoaded) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /><Typography sx={{ ml: 2 }}>지도 로딩 중...</Typography></Box>;
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label="프로텐"
          onClick={handleCenterMap}
          clickable
          color="primary"
          variant="filled"
        />
        {sampleRestaurants.map((r) => (
          <Chip
            key={r.id}
            label={r.name}
            onClick={() => handleListItemClick(r)}
            clickable
          />
        ))}
      </Box>
      <Box sx={{ height: '500px', width: '100%' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </Box>
    </Box>
  );
};

export default RestaurantMap;
