import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DonorLogin.css";

const DonorLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const doLogin = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "donor", identifier: email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("Login failed:", data);
          return alert("Login failed: " + (data.message || res.statusText));
        }

        // store token and user, then navigate
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/donor/dashboard");
      } catch (err) {
        console.error("Login error:", err);
        alert("Login error. Please try again.");
      }
    };

    doLogin();
  };

  return (
    <div className="donor-login-container">
      <form className="donor-login-form" onSubmit={handleSubmit}>
        <h2>Donor Login</h2>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Quick demo: <strong>demo@donor.com</strong> /{" "}
          <strong>password</strong>
        </p>
        <div style={{ marginBottom: "10px" }}>
          <button
            type="button"
            onClick={() => {
              setEmail("demo@donor.com");
              setPassword("password");
            }}
            style={{ padding: "6px 10px" }}
          >
            Use demo
          </button>
        </div>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
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
            onClick={() => navigate("/signup/donor")}
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

export default DonorLogin;
