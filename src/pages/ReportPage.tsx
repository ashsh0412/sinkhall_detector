import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Spin,
  List,
  Card,
  Input,
  Pagination,
  Space,
} from "antd";
import {
  fetchSinkholeInfo,
  fetchFacilitySafety,
  fetchSinkholeAccident,
} from "../api/publicApis";

const { Title, Paragraph } = Typography;
const { Content } = Layout;
const { Search } = Input;

interface RegionRisk {
  region: string;
  totalAccidents: number;
  recentAccidents: number;
  facilityStatus: string;
  riskTrend: string;
  riskReason: string;
  totalRepairCost: number;
  accidentYears: number[]; // 추가
}

const ReportPage: React.FC = () => {
  const [data, setData] = useState<RegionRisk[]>([]);
  const [filteredData, setFilteredData] = useState<RegionRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sinkholeInfo, facilityData, accidentData] = await Promise.all([
          fetchSinkholeInfo(1, 1000),
          fetchFacilitySafety(1, 1000),
          fetchSinkholeAccident(1, 1000),
        ]);

        const nowYear = new Date().getFullYear();
        const regionMap: Record<string, RegionRisk> = {};

        // 사고 데이터 기반으로 지역 생성
        // 사고 데이터 기반으로 지역 생성
        accidentData.forEach((acc) => {
          const region = `${acc.CTPV} ${acc.SGG}`;
          if (!regionMap[region]) {
            regionMap[region] = {
              region,
              totalAccidents: 0,
              recentAccidents: 0,
              facilityStatus: "미확인",
              riskTrend: "불확실",
              riskReason: "",
              totalRepairCost: 0,
              accidentYears: [], // 누락된 부분 추가
            };
          }
          regionMap[region].totalAccidents++;
          const year = parseInt(acc.OCRN_YMD?.slice(0, 4) || "0", 10);
          regionMap[region].accidentYears.push(year); // 사고 발생 연도 저장
          if (new Date().getFullYear() - year <= 3) {
            regionMap[region].recentAccidents++;
          }
        });

        // 복구 비용 추가 (상세 정보 기준)
        sinkholeInfo.forEach((info) => {
          const region = `${info.CTPV_NM} ${info.SGG_NM}`;
          if (!regionMap[region]) {
            regionMap[region] = {
              region,
              totalAccidents: 0,
              recentAccidents: 0,
              facilityStatus: "미확인",
              riskTrend: "불확실",
              riskReason: "",
              totalRepairCost: 0,
              accidentYears: [], // 추가
            };
          }
          const year = parseInt(info.OCRN_YMD?.slice(0, 4) || "0", 10);
          regionMap[region].accidentYears.push(year); // 발생년도 추가
          if (nowYear - year <= 3) {
            regionMap[region].totalRepairCost += parseInt(
              info.RSTR_CST || "0",
              10
            );
          }
        });

        // 시설물 상태 추가
        facilityData.forEach((fac) => {
          const key = fac.PSTN.split(" ")[0];
          Object.keys(regionMap).forEach((region) => {
            if (region.includes(key)) {
              regionMap[region].facilityStatus = fac.STTS_GRD_NM || "미확인";
            }
          });
        });

        Object.values(regionMap).forEach((region) => {
          let riskScore = 0;
          const reasons: string[] = [];

          if (region.recentAccidents > 0) {
            if (region.recentAccidents >= 6) {
              riskScore += 10;
              reasons.push("최근 3년간 사고 다발 지역");
            } else if (region.recentAccidents >= 3) {
              riskScore += 7;
              reasons.push("최근 3년간 사고 빈번");
            } else {
              riskScore += 4;
              reasons.push("최근 사고 발생");
            }
          }

          if (region.totalAccidents >= 20) {
            riskScore += 10;
            reasons.push("장기적으로 사고 누적됨");
          } else if (region.totalAccidents >= 13) {
            riskScore += 5;
            reasons.push("과거 사고 다발");
          }

          if (region.facilityStatus.includes("D")) {
            riskScore += 10;
            reasons.push("시설물 심각한 노후화");
          } else if (region.facilityStatus.includes("C")) {
            riskScore += 5;
            reasons.push("시설물 노후화");
          }

          if (riskScore >= 13) {
            region.riskTrend = "위험";
          } else if (riskScore >= 4) {
            region.riskTrend = "보통";
          } else {
            region.riskTrend = "안정적";
          }

          region.riskReason =
            reasons.length > 0 ? reasons.join(", ") : "특이 사항 없음";
        });

        const sortedData = Object.values(regionMap).sort(
          (a, b) => b.totalAccidents - a.totalAccidents
        );

        setData(sortedData);
        setFilteredData(sortedData);
      } catch (err) {
        console.error("❌ 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = (value: string) => {
    const filtered = data.filter((item) => item.region.includes(value));
    setFilteredData(filtered);
    setSearchText(value);
    setCurrentPage(1);
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Layout>
      <Content style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2}>📊 전국 지반 위험 분석 보고서</Title>
          <Paragraph>
            전국 모든 사고 이력과 시설물 상태를 기반으로 분석한 보고서입니다.
          </Paragraph>

          <Search
            placeholder="지역명 검색"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
            allowClear
            style={{ maxWidth: 300 }}
          />

          {loading ? (
            <Spin spinning={loading} tip="로딩 중..." fullscreen />
          ) : (
            <>
              <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={paginatedData}
                renderItem={(item) => (
                  <List.Item>
                    <Card title={item.region}>
                      <p>총 사고 발생 건수: {item.totalAccidents}</p>
                      <p>최근 3년 사고 건수: {item.recentAccidents}</p>
                      <p>
                        최근 3년 총 복구 비용:{" "}
                        {item.totalRepairCost.toLocaleString()} 원
                      </p>
                      <p>시설물 상태 등급: {item.facilityStatus}</p>
                      <p>위험 추세: {item.riskTrend}</p>
                      <p>위험 요인: {item.riskReason}</p>
                    </Card>
                  </List.Item>
                )}
              />
              <Pagination
                current={currentPage}
                total={filteredData.length}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 16,
                }}
              />
            </>
          )}
        </Space>
      </Content>
    </Layout>
  );
};

export default ReportPage;
