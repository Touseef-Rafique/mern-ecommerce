import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        navigate("/all-products");
      } else {
        setError(data.message || "User already exists!");
      }
    } catch (error) {
      console.error("Signup Error:", error);
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
      <div style={{ textAlign: "center" }}>
        <h1 className="mb-3" style={{ color: "#fff", fontFamily: "var(--font-display)" }}>
          Welcome to Technest
        </h1>
        <div className="card p-4 shadow-lg" style={{ width: "25rem", margin: "auto", borderRadius: "var(--radius)", border: "none" }}>
          <h2 className="text-center mb-4" style={{ fontSize: 19, color: "var(--circuit)" }}>Create your account</h2>
          <form onSubmit={handleSignup}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {error && <p className="field-error">{error}</p>}
            </div>
            <button type="submit" className="btn-add-cart" style={{ width: "100%" }}>
              Sign Up
            </button>
          </form>

          <p className="text-center mt-3 mb-1" style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Already have an account?
          </p>
          <button className="btn-ghost" style={{ width: "100%" }} onClick={() => navigate("/")}>
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;