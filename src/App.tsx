// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/HomePage";
import MapPage from "./pages/MapPage";

const App = () => {
  return (
    <Router>
      <nav style={{ marginBottom: "20px" }}>
        <Link to="/">홈</Link> | <Link to="/map">지도</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Router>
  );
};

export default App;
