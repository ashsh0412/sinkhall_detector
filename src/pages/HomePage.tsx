import React, { useEffect, useState } from "react";
import { Table, Typography, Layout, Spin, Space, Input, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { fetchSinkholeAccident, fetchFacilitySafety } from "../api/publicApis";

const { Title } = Typography;
const { Content } = Layout;
const { Search } = Input;

interface RegionSummary {
  region: string;
  accidentCount: number;
  recentAccidentDate: string;
  facilityStatus: string;
  riskLevel: string;
}

const formatDate = (dateString: string) => {
  if (!dateString || dateString.length !== 8) return "-";
  return `${dateString.slice(0, 4)}년 ${dateString.slice(
    4,
    6
  )}월 ${dateString.slice(6, 8)}일`;
};

const HomePage: React.FC = () => {
  const [data, setData] = useState<RegionSummary[]>([]);
  const [filteredData, setFilteredData] = useState<RegionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accidents, facilities] = await Promise.all([
          fetchSinkholeAccident(),
          fetchFacilitySafety(),
        ]);

        const regionMap: Record<string, RegionSummary> = {};

        accidents.forEach((acc) => {
          const key = `${acc.CTPV} ${acc.SGG}`;
          if (!regionMap[key]) {
            regionMap[key] = {
              region: key,
              accidentCount: 0,
              recentAccidentDate: acc.OCRN_YMD,
              facilityStatus: "미확인",
              riskLevel: "낮음",
            };
          }
          regionMap[key].accidentCount++;

          // 더 최근 사고 발생일로 업데이트
          if (acc.OCRN_YMD > regionMap[key].recentAccidentDate) {
            regionMap[key].recentAccidentDate = acc.OCRN_YMD;
          }
        });

        facilities.forEach((fac) => {
          const key = fac.PSTN.split(" ")[0];
          Object.keys(regionMap).forEach((region) => {
            if (region.includes(key)) {
              regionMap[region].facilityStatus = fac.STTS_GRD_NM || "미확인";
            }
          });
        });

        Object.values(regionMap).forEach((region) => {
          if (
            region.accidentCount >= 3 ||
            region.facilityStatus.includes("C")
          ) {
            region.riskLevel = "위험";
          } else if (region.accidentCount >= 1) {
            region.riskLevel = "보통";
          }
        });

        const result = Object.values(regionMap);
        setData(result);
        setFilteredData(result);
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
  };

  const columns: ColumnsType<RegionSummary> = [
    {
      title: "지역",
      dataIndex: "region",
      key: "region",
    },
    {
      title: "사고 건수",
      dataIndex: "accidentCount",
      key: "accidentCount",
      sorter: (a, b) => a.accidentCount - b.accidentCount,
      showSorterTooltip: { title: "사고 건수 순서 변경" },
    },
    {
      title: "최근 사고 발생일",
      dataIndex: "recentAccidentDate",
      key: "recentAccidentDate",
      render: (date: string) => formatDate(date),
      sorter: (a, b) =>
        a.recentAccidentDate.localeCompare(b.recentAccidentDate),
      showSorterTooltip: { title: "최근 사고 발생일 순서 변경" },
    },
    {
      title: <Tooltip>시설물 상태 등급</Tooltip>,
      dataIndex: "facilityStatus",
      key: "facilityStatus",
      sorter: (a, b) => a.facilityStatus.localeCompare(b.facilityStatus),
      showSorterTooltip: { title: "시설물 상태 등급 기준으로 정렬" },
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2}>지반 위험 분석 대시보드</Title>
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
            <Table
              dataSource={filteredData}
              columns={columns}
              rowKey="region"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Space>
      </Content>
    </Layout>
  );
};

export default HomePage;
