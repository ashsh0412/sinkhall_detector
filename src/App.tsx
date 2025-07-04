import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Layout, Menu } from "antd";
import Home from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import ReportPage from "./pages/ReportPage";

const { Header, Content } = Layout;

const App = () => {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[
            location.pathname === "/map"
              ? "map"
              : location.pathname === "/report"
              ? "report"
              : "home",
          ]}
          items={[
            { key: "home", label: <Link to="/">홈</Link> },
            { key: "map", label: <Link to="/map">지도</Link> },
            { key: "report", label: <Link to="/report">보고서</Link> }, // ✅ 보고서 메뉴 추가
          ]}
        />
      </Header>
      <Content>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/report" element={<ReportPage />} />{" "}
          {/* ✅ 보고서 경로 */}
        </Routes>
      </Content>
    </Layout>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
