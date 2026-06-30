import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://mern-ecommerce-rmt9.onrender.com/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
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
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "var(--ink)",
        padding: 20,
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{ width: "25rem", borderRadius: "var(--radius)", border: "none" }}
      >
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--ink)" }}>
            Technest<span style={{ color: "var(--volt-dark)" }}>.</span>
          </span>
        </div>
        <h2 className="text-center mb-4" style={{ fontSize: 19, color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: 500 }}>
          Welcome back
        </h2>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {error && <p className="field-error">{error}</p>}
          </div>

          <button type="submit" className="btn-add-cart" style={{ width: "100%" }}>
            Log in
          </button>
        </form>

        <p className="text-center mt-3 mb-2" style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Don't have an account?
        </p>

        <button
          className="btn-ghost"
          style={{ width: "100%" }}
          onClick={() => navigate("/signup")}
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Login;