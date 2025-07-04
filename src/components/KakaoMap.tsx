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
    if (!window.kakao || !window.kakao.maps || !mapRef.current) {
      console.error("❌ Kakao Maps SDK 로드 실패");
      return;
    }

    // SDK 완전히 로드된 후 실행
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
