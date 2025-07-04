// src/api/safetyDataApi.ts

// ✅ Proxy를 통해 요청하므로 실제 API 서버 주소 제거
const API_BASE_URL = "/api";

// 각 API별 서비스키 (실제로는 백엔드로 옮겨야 보안 안전)
const SINKHOLE_RISK_KEY = "9LHM10A9M7K26WS1";
const SINKHOLE_ACCIDENT_KEY = "XH1988BO93BPS43L";
const SINKHOLE_INFO_KEY = "RZT3SQABC45Z2B99";
const FACILITY_SAFETY_KEY = "2FBZB52UZT14EB0R";

/* ---------- 1. 지반침하 위험도 평가 ---------- */
export interface SinkholeRiskItem {
  SENU: string;
  EVL_NO: string;
  EVL_NM: string;
}

export async function fetchSinkholeRisk(
  pageNo = 1,
  numOfRows = 10
): Promise<SinkholeRiskItem[]> {
  const url = `${API_BASE_URL}/DSSP-IF-00752?serviceKey=${SINKHOLE_RISK_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&returnType=json`;
  return fetchData<SinkholeRiskItem>(url);
}

/* ---------- 2. 지반침하 사고 목록 ---------- */
export interface SinkholeAccidentItem {
  ACDNT_NO: string;
  CTPV: string;
  SGG: string;
  DTL_OCRN_CS: string;
  OCRN_YMD: string;
  SENU: string;
}

export async function fetchSinkholeAccident(
  pageNo = 1,
  numOfRows = 10
): Promise<SinkholeAccidentItem[]> {
  const url = `${API_BASE_URL}/DSSP-IF-00754?serviceKey=${SINKHOLE_ACCIDENT_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&returnType=json`;
  return fetchData<SinkholeAccidentItem>(url);
}

/* ---------- 3. 지반침하 상세 정보 ---------- */
export interface SinkholeInfoItem {
  CTPV_NM: string;
  SGG_NM: string;
  GROU_SBSDC_RGN_DTL_INFO: string;
  LAT: string;
  LOT: string;
  OCRN_YMD: string;
  OCRN_SCL_WDTH: string;
  OCRN_SCL_PRLG: string;
  OCRN_SCL_DPTH: string;
  OCRN_RGN_NOSO_KND_NM: string;
  FRST_OCRN_CS: string;
  DAM_DCSD_CNT: string;
  DAM_INJPSN_CNT: string;
  DAM_VHCL_CNTOM: string;
  RSTR_STTS_NM: string;
  RSTR_MTHD: string;
  RSTR_CST: string;
  RSTR_CMPTN_YMD: string;
  DTIN_CRTR_YMD: string;
}

export async function fetchSinkholeInfo(
  pageNo = 1,
  numOfRows = 10
): Promise<SinkholeInfoItem[]> {
  const url = `${API_BASE_URL}/DSSP-IF-20608?serviceKey=${SINKHOLE_INFO_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&returnType=json`;
  return fetchData<SinkholeInfoItem>(url);
}

/* ---------- 4. 상하수도 시설물 안전 관리 ---------- */
export interface FacilitySafetyItem {
  FCLTY_NO: string;
  FCLTY_NM: string;
  FCLTY_SE_NM: string;
  FCLTY_KND: string;
  FCLTY_ASRT: string;
  STTS_GRD_NM: string;
  RCNT_CHCK_DGNS_DAY: string;
  NETE_CHCK_DGNS_DAY: string;
  PSTN: string;
  FRVI_PHOTO: string;
  FRNT_SIDE_ETC_PHOTO: string;
  GAAD_INST: string;
  FCLTY_MAIN_SPCFC: string;
  CMCN_DAY: string;
}

export async function fetchFacilitySafety(
  pageNo = 1,
  numOfRows = 10
): Promise<FacilitySafetyItem[]> {
  const url = `${API_BASE_URL}/DSSP-IF-00762?serviceKey=${FACILITY_SAFETY_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&returnType=json`;
  return fetchData<FacilitySafetyItem>(url);
}

/* ---------- 공통 fetch 함수 ---------- */
async function fetchData<T>(url: string): Promise<T[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const json = await response.json();

    const items: T[] = json?.body;

    if (!items) {
      console.warn("⚠️ body가 없음:", items);
      return [];
    }

    return Array.isArray(items) ? items : [items]; // 단일 객체면 배열로 변환
  } catch (error) {
    console.error("❌ API 호출 실패:", error);
    return [];
  }
}
