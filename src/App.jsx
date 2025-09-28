import React, { Suspense, lazy } from "react";
import { Provider } from "react-redux";
import {
  Link,
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Loading from "./components/common/Loading";
import { store } from "./store/store";

// Lazy load components
const LiveDashboard = lazy(
  () => import("./components/dashboard/LiveDashboard")
);
const AIDashboard = lazy(() => import("./components/ai/AIDashboard"));
const GoogleSheetsIntegration = lazy(
  () => import("./components/google/GoogleSheetsIntegration")
);

// Home component
const Home = () => (
  <div className="home-container">
    <div className="hero-section">
      <h1>🚀 React OAS Integration v3.0</h1>
      <p>Production-Ready Platform with Real-time Dashboard</p>
    </div>

    <div className="features-grid">
      <div className="feature-card primary">
        <h3>📊 Live Dashboard</h3>
        <p>
          Real-time metrics, performance monitoring, and system analytics with
          WebSocket integration.
        </p>
        <Link to="/dashboard" className="btn-primary">
          Open Dashboard
        </Link>
      </div>

      <div className="feature-card secondary">
        <h3>🧠 AI Analytics</h3>
        <p>
          AI-powered insights, predictions, and intelligent recommendations for
          your system.
        </p>
        <Link to="/ai-analytics" className="btn-primary">
          Open AI Analytics
        </Link>
      </div>

      <div className="feature-card tertiary">
        <h3>📊 Google Sheets</h3>
        <p>
          Tích hợp Google Sheets để quản lý dữ liệu, báo cáo và tự động hóa quy
          trình làm việc.
        </p>
        <Link to="/google-sheets" className="btn-primary">
          Mở Google Sheets
        </Link>
      </div>
    </div>

    <div className="features-grid">
      <div className="feature-card">
        <h3>📈 System Status</h3>
        <div className="status-list">
          <div className="status-item">✅ Frontend: Optimized & Deployed</div>
          <div className="status-item">✅ Backend: WebSocket Ready</div>
          <div className="status-item">✅ Automation: Active</div>
        </div>
        <button className="btn-secondary" disabled>
          All Systems Operational
        </button>
      </div>

      <div className="feature-card">
        <h3>🎯 What's New in v3.0</h3>
        <div className="feature-tags">
          {[
            "📡 Real-time WebSocket Integration",
            "📊 Live Performance Dashboard",
            "⚡ 50% Performance Improvement",
            "🎨 Modern UI/UX Design",
            "📱 Responsive Mobile Support",
            "🔒 Enhanced Security Features",
          ].map((feature, index) => (
            <span key={index} className="feature-tag">
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Navigation component
const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="top-nav">
      <Link to="/" className="nav-brand">
        🚀 React OAS Integration v3.0
      </Link>
      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${currentPath === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className={`nav-link dashboard-link ${currentPath === "/dashboard" ? "active" : ""}`}
        >
          📊 Live Dashboard
        </Link>
        <Link
          to="/ai-analytics"
          className={`nav-link ai-link ${currentPath === "/ai-analytics" ? "active" : ""}`}
        >
          🧠 AI Analytics
        </Link>
        <Link
          to="/google-sheets"
          className={`nav-link sheets-link ${currentPath === "/google-sheets" ? "active" : ""}`}
        >
          📊 Google Sheets
        </Link>
      </div>
    </nav>
  );
};

// Main App component with Router
function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<LiveDashboard />} />
                <Route path="/ai-analytics" element={<AIDashboard />} />
                <Route
                  path="/google-sheets"
                  element={<GoogleSheetsIntegration />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
