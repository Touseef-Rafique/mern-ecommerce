import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("https://mern-ecommerce-rmt9.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAdmin", data.isAdmin ? "true" : "false");
        setIsAuthenticated(true);
        navigate("/all-products");
      } else {
        setError(data.message || "Invalid email or password!");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Something went wrong. Try again!");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-visual">
        <div className="brand-lockup">
          Technest<span className="dot">.</span>
        </div>
        <div>
          <h2>
            Every spec.
            <br />
            Every price.
            <br />
            <em style={{ fontStyle: "normal", color: "#a5b4fc" }}>One place.</em>
          </h2>
          <p>Sign in to track orders, build your wishlist and compare phones side by side.</p>
          <ul className="auth-points">
            <li>PTA-approved devices only</li>
            <li>Nationwide 2–4 day delivery</li>
            <li>7-day easy returns</li>
          </ul>
        </div>
        <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.4)" }}>
          © 2026 Technest · Pakistan
        </p>
      </aside>

      <main className="auth-form-wrap">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="sub">Log in to your Technest account</p>

          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              {error && <p className="field-error">{error}</p>}
            </div>

            <button type="submit" className="btn-add-cart" style={{ width: "100%" }} disabled={busy}>
              {busy ? "Logging in…" : "Log in"}
            </button>
          </form>

          <div className="auth-divider">NEW HERE?</div>

          <button className="btn-ghost" style={{ width: "100%" }} onClick={() => navigate("/signup")}>
            Create an account
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;