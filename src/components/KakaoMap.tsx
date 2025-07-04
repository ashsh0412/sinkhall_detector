import React, { useEffect, useRef } from "react";

// Declare kakao on the Window interface
declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  latitude: number;
  longitude: number;
  level?: number;
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  latitude,
  longitude,
  level = 3,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.kakao.maps.load(() => {
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: level,
      };

      const map = new window.kakao.maps.Map(container, options);

      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(latitude, longitude),
      });
    });
  }, [latitude, longitude, level]);

  return <div ref={mapRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default KakaoMap;
