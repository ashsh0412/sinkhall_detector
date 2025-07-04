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
  fetchSinkholeRisk,
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
        const [sinkholeInfo, facilityData] = await Promise.all([
          fetchSinkholeInfo(1, 1000),
          fetchFacilitySafety(1, 1000),
          fetchSinkholeAccident(1, 1000),
          fetchSinkholeRisk(1, 1000),
        ]);

        const nowYear = new Date().getFullYear();
        const regionMap: Record<string, RegionRisk> = {};

        sinkholeInfo.forEach((item) => {
          const region = `${item.CTPV_NM} ${item.SGG_NM}`;
          if (!regionMap[region]) {
            regionMap[region] = {
              region,
              totalAccidents: 0,
              recentAccidents: 0,
              facilityStatus: "미확인",
              riskTrend: "불확실",
              riskReason: "",
              totalRepairCost: 0,
            };
          }

          regionMap[region].totalAccidents++;

          const year = parseInt(item.OCRN_YMD?.slice(0, 4) || "0", 10);
          if (nowYear - year <= 3) {
            regionMap[region].recentAccidents++;
            regionMap[region].totalRepairCost += parseInt(
              item.RSTR_CST || "0",
              10
            );
          }
        });

        facilityData.forEach((fac) => {
          const key = fac.PSTN.split(" ")[0];
          Object.keys(regionMap).forEach((region) => {
            if (region.includes(key)) {
              regionMap[region].facilityStatus = fac.STTS_GRD_NM || "미확인";
            }
          });
        });

        Object.values(regionMap).forEach((region) => {
          const reasons = [];
          if (region.recentAccidents >= 3) reasons.push("최근 사고 다발 지역");
          if (region.facilityStatus.includes("C"))
            reasons.push("시설물 노후화 심각");
          if (region.totalAccidents >= 5)
            reasons.push("장기적으로 사고 누적됨");

          region.riskReason = reasons.length
            ? reasons.join(", ")
            : "특이 사항 없음";

          if (
            region.recentAccidents >= 6 ||
            region.facilityStatus.includes("C")
          ) {
            region.riskTrend = "위험 증가";
          } else if (region.recentAccidents === 0) {
            region.riskTrend = "안정적";
          } else {
            region.riskTrend = "보통";
          }
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
          <Title level={2}>📊 지역별 지반 위험 분석 보고서</Title>
          <Paragraph>
            최근 사고 발생 건수, 시설물 상태, 위험도 추세, 복구 비용 등을 종합한
            보고서입니다.
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
