import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./HospitalNavbar.css";

const HospitalNavbar = () => {
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
    <nav className="hospital-navbar">
      <div className="nav-brand">
        <span className="brand-icon">Blood Warriors</span>
        <span className="brand-text">Hospital Dashboard</span>
      </div>

      <div className="nav-links">
        <button
          className={`nav-link ${isActive("/hospital/info")}`}
          onClick={() => navigate("/hospital/info")}
        >
          Information
        </button>
        <button
          className={`nav-link ${isActive("/hospital/blooddata")}`}
          onClick={() => navigate("/hospital/blooddata")}
        >
          Blood Data
        </button>
        <button
          className={`nav-link ${isActive("/hospital/bloodbanks")}`}
          onClick={() => navigate("/hospital/bloodbanks")}
        >
          Blood Banks
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
              return u.name || u.id || null;
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

export default HospitalNavbar;
