import React, { useEffect, useRef } from "react";
import {
  fetchSinkholeInfo,
  fetchFacilitySafety,
  type SinkholeInfoItem,
  type FacilitySafetyItem,
} from "../api/publicApis";

declare global {
  interface Window {
    kakao: any;
  }
}

const MapPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) {
      console.error("❌ Kakao Maps SDK 로드 실패");
      return;
    }

    window.kakao.maps.load(async () => {
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울시청
        level: 11,
      });

      const geocoder = new window.kakao.maps.services.Geocoder();

      const createInfoWindow = (content: string) => {
        return new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px; white-space:pre-line">${content}</div>`,
        });
      };

      let currentOpenInfoWindow: any = null;

      // ✅ 1. 지반침하 상세 정보
      const infoData: SinkholeInfoItem[] = await fetchSinkholeInfo(1, 10);
      infoData.forEach((item) => {
        if (item.LAT !== "0" && item.LOT !== "0") {
          const coords = new window.kakao.maps.LatLng(
            parseFloat(item.LAT),
            parseFloat(item.LOT)
          );
          const marker = new window.kakao.maps.Marker({
            map,
            position: coords,
            title: `[지반상세] ${item.GROU_SBSDC_RGN_DTL_INFO}`,
          });

          const infoWindow = createInfoWindow(
            `지반침하 상세 정보\n위치: ${item.GROU_SBSDC_RGN_DTL_INFO}\n발생일: ${item.OCRN_YMD}`
          );

          window.kakao.maps.event.addListener(marker, "click", () => {
            if (currentOpenInfoWindow === infoWindow) {
              infoWindow.close();
              currentOpenInfoWindow = null;
            } else {
              if (currentOpenInfoWindow) currentOpenInfoWindow.close();
              infoWindow.open(map, marker);
              currentOpenInfoWindow = infoWindow;
            }
          });
        }
      });

      // ✅ 2. 상하수도 시설물 안전 관리
      const facilityData: FacilitySafetyItem[] = await fetchFacilitySafety(
        1,
        10
      );
      for (const item of facilityData) {
        geocoder.addressSearch(item.PSTN, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              result[0].y,
              result[0].x
            );
            const marker = new window.kakao.maps.Marker({
              map,
              position: coords,
              title: `[시설물] ${item.FCLTY_NM}`,
            });

            const infoWindow = createInfoWindow(
              `상하수도 시설물 안전 관리\n명칭: ${item.FCLTY_NM}\n위치: ${item.PSTN}\n상태 등급: ${item.STTS_GRD_NM}`
            );

            window.kakao.maps.event.addListener(marker, "click", () => {
              if (currentOpenInfoWindow === infoWindow) {
                infoWindow.close();
                currentOpenInfoWindow = null;
              } else {
                if (currentOpenInfoWindow) currentOpenInfoWindow.close();
                infoWindow.open(map, marker);
                currentOpenInfoWindow = infoWindow;
              }
            });
          } else {
            console.warn(`❌ 주소 검색 실패: ${item.PSTN}`);
          }
        });
      }
    });
  }, []);

  return <div ref={mapRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default MapPage;
