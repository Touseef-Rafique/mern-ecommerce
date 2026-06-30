import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/styles.css";
import ProductCard from "./ProductCard";

const API_ROOT = "https://mern-ecommerce-rmt9.onrender.com";

const Product = () => {
  const { brand } = useParams();
  const [mobiles, setMobiles] = useState([]);
  const [status, setStatus] = useState("loading");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    setStatus("loading");
    fetch(`${API_ROOT}/api/mobiles`)
      .then((res) => res.json())
      .then((data) => {
        setMobiles(data.filter((mobile) => mobile.brand === brand));
        setStatus("ready");
      })
      .catch((error) => {
        console.error("Error fetching mobiles:", error);
        setStatus("error");
      });
  }, [brand]);

  const sorted = useMemo(() => {
    const list = [...mobiles];
    if (sortBy === "price-asc") return list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") return list.sort((a, b) => b.price - a.price);
    return list;
  }, [mobiles, sortBy]);

  return (
    <div className="products-container">
      <Link to="/all-products" className="btn-ghost" style={{ marginBottom: 16, display: "inline-block" }}>
        ← All products
      </Link>
      <h2 className="title" style={{ textTransform: "capitalize" }}>{brand} Mobiles</h2>

      <div className="toolbar">
        <span className="result-count">{mobiles.length} model{mobiles.length !== 1 ? "s" : ""}</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="default">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {status === "loading" && (
        <div className="skeleton-row">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="skeleton-card" key={i} />
          ))}
        </div>
      )}

      {status === "ready" && (
        sorted.length > 0 ? (
          <div className="products-grid">
            {sorted.map((mobile) => (
              <ProductCard key={mobile._id} mobile={mobile} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h4>No {brand} mobiles found</h4>
            <p>This brand may be out of stock right now.</p>
          </div>
        )
      )}

      {status === "error" && (
        <div className="empty-state">
          <h4>We couldn't load this brand</h4>
          <p>Check your connection and try again.</p>
        </div>
      )}
    </div>
  );
};

export default Product;