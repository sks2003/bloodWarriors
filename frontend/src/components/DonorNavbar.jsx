import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DonorNavbar.css";

const DonorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="donor-navbar">
      <div className="nav-brand">
        <span className="brand-icon">Blood Warriors</span>
        <span className="brand-text">Donor Dashboard</span>
      </div>

      <div className="nav-links">
        <button
          className={`nav-link ${isActive("/donor/dashboard")}`}
          onClick={() => navigate("/donor/dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`nav-link ${isActive("/donor/alerts")}`}
          onClick={() => navigate("/donor/alerts")}
        >
          Alerts
        </button>
        <button
          className={`nav-link ${isActive("/donor/profile")}`}
          onClick={() => navigate("/donor/profile")}
        >
          Profile
        </button>
      </div>

      <div className="nav-actions">
        <div style={{ marginRight: 12 }}>
          {/* show user name if available */}
          {(() => {
            const s = localStorage.getItem("user");
            if (!s) return null;
            try {
              const u = JSON.parse(s);
              return u.name || u.email || null;
            } catch (e) {
              return null;
            }
          })()}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default DonorNavbar;
