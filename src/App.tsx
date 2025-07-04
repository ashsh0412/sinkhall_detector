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

const { Header, Content } = Layout;

const App = () => {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname === "/map" ? "map" : "home"]}
          items={[
            { key: "home", label: <Link to="/">홈</Link> },
            { key: "map", label: <Link to="/map">지도</Link> },
          ]}
        />
      </Header>
      <Content>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
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
