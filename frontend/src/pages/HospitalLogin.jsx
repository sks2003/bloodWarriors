import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalLogin.css";

const HospitalLogin = () => {
  const navigate = useNavigate();

  const [hospitalId, setHospitalId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const doLogin = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "hospital",
            identifier: hospitalId,
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("Login failed:", data);
          return alert("Login failed: " + (data.message || res.statusText));
        }

        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/hospital/dashboard");
      } catch (err) {
        console.error("Login error:", err);
        alert("Login error. Please try again.");
      }
    };

    doLogin();
  };

  return (
    <div className="hospital-login-container">
      <form className="hospital-login-form" onSubmit={handleSubmit}>
        <h2>Hospital Login</h2>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Quick demo: <strong>HOSP001</strong> / <strong>password</strong>
        </p>
        <div style={{ marginBottom: "10px" }}>
          <button
            type="button"
            onClick={() => {
              setHospitalId("HOSP001");
              setPassword("password");
            }}
            style={{ padding: "6px 10px" }}
          >
            Use demo
          </button>
        </div>

        <label>Hospital ID</label>
        <input
          type="text"
          value={hospitalId}
          onChange={(e) => setHospitalId(e.target.value)}
          placeholder="e.g., HOSP001"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <button type="submit">Login</button>

        <div className="login-actions">
          <button
            type="button"
            className="signup-link"
            onClick={() => navigate("/signup/hospital")}
          >
            Don't have an account? Sign up here
          </button>
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </form>
    </div>
  );
};

export default HospitalLogin;
