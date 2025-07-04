import React, { useEffect, useState } from "react";
import {
  fetchSinkholeRisk,
  fetchSinkholeAccident,
  fetchSinkholeInfo,
  fetchFacilitySafety,
  type SinkholeRiskItem,
  type SinkholeAccidentItem,
  type SinkholeInfoItem,
  type FacilitySafetyItem,
} from "../api/publicApis";

const Home: React.FC = () => {
  const [riskData, setRiskData] = useState<SinkholeRiskItem[]>([]);
  const [accidentData, setAccidentData] = useState<SinkholeAccidentItem[]>([]);
  const [infoData, setInfoData] = useState<SinkholeInfoItem[]>([]);
  const [facilityData, setFacilityData] = useState<FacilitySafetyItem[]>([]);

  useEffect(() => {
    const loadAllData = async () => {
      const risk = await fetchSinkholeRisk();
      const accident = await fetchSinkholeAccident();
      const info = await fetchSinkholeInfo();
      const facility = await fetchFacilitySafety();

      console.log("✅ 지반침하 위험도 평가 데이터:", risk);
      console.log("✅ 지반침하 사고 목록 데이터:", accident);
      console.log("✅ 지반침하 상세정보 데이터:", info);
      console.log("✅ 상하수도 시설물 안전 관리 데이터:", facility);

      setRiskData(risk);
      setAccidentData(accident);
      setInfoData(info);
      setFacilityData(facility);
    };

    loadAllData();
  }, []);

  return (
    <div>
      <h1>전체 데이터 조회 결과</h1>

      <h2>✅ 지반침하 위험도 평가</h2>
      <ul>
        {riskData.map((item) => (
          <li key={item.SENU}>
            {item.EVL_NM} (평가번호: {item.EVL_NO})
          </li>
        ))}
      </ul>

      <h2>⚠️ 지반침하 사고 목록</h2>
      <ul>
        {accidentData.map((item) => (
          <li key={item.SENU}>
            {item.CTPV} {item.SGG} - {item.DTL_OCRN_CS} ({item.OCRN_YMD})
          </li>
        ))}
      </ul>

      <h2>📍 지반침하 상세 정보</h2>
      <ul>
        {infoData.map((item, idx) => (
          <li key={idx}>
            {item.CTPV_NM} {item.SGG_NM} {item.GROU_SBSDC_RGN_DTL_INFO}
            <br />
            발생일: {item.OCRN_YMD}, 위치: {item.LAT}, {item.LOT}
            <br />
            원인: {item.FRST_OCRN_CS}, 피해 사망자 수: {item.DAM_DCSD_CNT}
          </li>
        ))}
      </ul>

      <h2>🏗️ 상하수도 시설물 안전 관리</h2>
      <ul>
        {facilityData.map((item) => (
          <li key={item.FCLTY_NO}>
            {item.FCLTY_NM} ({item.FCLTY_SE_NM}, {item.FCLTY_KND})
            <br />
            위치: {item.PSTN}, 상태 등급: {item.STTS_GRD_NM}
            <br />
            최근 점검일: {item.RCNT_CHCK_DGNS_DAY}, 다음 점검일:{" "}
            {item.NETE_CHCK_DGNS_DAY}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
