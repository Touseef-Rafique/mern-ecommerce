import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";

const Signup = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("https://mern-ecommerce-rmt9.onrender.com/signup", {
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
        setError(data.message || "User already exists!");
      }
    } catch (err) {
      console.error("Signup Error:", err);
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
            Join the
            <br />
            <em style={{ fontStyle: "normal", color: "#a5b4fc" }}>spec-first</em> store.
          </h2>
          <p>Create an account to save phones, compare specs and check out in minutes.</p>
          <ul className="auth-points">
            <li>Save unlimited phones to your wishlist</li>
            <li>Compare up to 3 devices side by side</li>
            <li>Faster checkout with saved details</li>
          </ul>
        </div>
        <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.4)" }}>
          © 2026 Technest · Pakistan
        </p>
      </aside>

      <main className="auth-form-wrap">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="sub">It takes less than a minute</p>

          <form onSubmit={handleSignup}>
            <div className="field">
              <label htmlFor="name">Username</label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter username" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
              {error && <p className="field-error">{error}</p>}
            </div>

            <button type="submit" className="btn-add-cart" style={{ width: "100%" }} disabled={busy}>
              {busy ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <div className="auth-divider">ALREADY REGISTERED?</div>

          <button className="btn-ghost" style={{ width: "100%" }} onClick={() => navigate("/")}>
            Log in
          </button>
        </div>
      </main>
    </div>
  );
};

export default Signup;