import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/styles.css";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import ProductReviews from "./ProductReviews";
import ProductCard from "./ProductCard";

const API_ROOT = "http://:5000";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickQty, setPickQty] = useState(1);
  const { cartMap, addToCart } = useCart();
  const { showToast } = useToast();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    fetch(`${API_ROOT}/api/mobiles/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
        if (data?.brand) {
          fetch(`${API_ROOT}/api/mobiles`)
            .then((res) => res.json())
            .then((all) => {
              setRelated(
                all.filter((m) => m.brand === data.brand && m._id !== data._id).slice(0, 4)
              );
            })
            .catch(() => setRelated([]));
        }
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="skeleton-card" style={{ maxWidth: 700, height: 320, margin: "0 auto" }} />
      </div>
    );

  if (!product)
    return (
      <div className="empty-state">
        <h4>Product not found</h4>
        <Link to="/all-products" className="btn-ghost">← Back to products</Link>
      </div>
    );

  const inCartQty = cartMap[product._id] || 0;
  const wishlisted = isWishlisted(product._id);

  return (
    <div className="container mt-5">
      <div style={{ marginBottom: 16, fontSize: 14, color: "var(--text-muted)" }}>
        <Link to="/all-products" className="btn-ghost" style={{ padding: "4px 10px" }}>
          All products
        </Link>
        {" "}/{" "}
        <Link to={`/product/${product.brand}`} className="btn-ghost" style={{ padding: "4px 10px", textTransform: "capitalize" }}>
          {product.brand}
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg p-4" style={{ border: "none", borderRadius: "var(--radius)" }}>
            <div className="row">
              <div className="col-md-6 text-center" style={{ position: "relative" }}>
                <button
                  className={`btn-wishlist ${wishlisted ? "is-active" : ""}`}
                  style={{ position: "absolute", top: 0, right: 0 }}
                  onClick={() => {
                    toggleWishlist(product);
                    showToast(wishlisted ? `Removed from wishlist` : `Saved to wishlist`, "info");
                  }}
                  aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                >
                  {wishlisted ? "♥" : "♡"}
                </button>
                <img
                  src={
                    product.image
                      ? product.image.startsWith("http")
                        ? product.image
                        : `${API_ROOT}/${product.image}`
                      : "https://via.placeholder.com/300?text=Technest"
                  }
                  className="img-fluid"
                  alt={product.name}
                  style={{ maxHeight: 320, objectFit: "contain" }}
                />
              </div>

              <div className="col-md-6">
                <h2 style={{ fontFamily: "var(--font-display)" }}>{product.name}</h2>
                <h5 className="text-muted" style={{ textTransform: "capitalize" }}>Brand: {product.brand}</h5>
                <h4 className="fw-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}>
                  {product.price?.toLocaleString()} PKR
                </h4>
                <span style={{ color: "var(--circuit)", fontSize: 13, fontWeight: 600 }}>● In stock</span>

                <h5 className="mt-4">Specifications</h5>
                <ul className="list-group">
                  <li className="list-group-item">📱 RAM: {product.specs?.ram || "—"}</li>
                  <li className="list-group-item">💾 Storage: {product.specs?.storage || "—"}</li>
                  <li className="list-group-item">🔋 Battery: {product.specs?.battery || "—"}</li>
                  <li className="list-group-item">📷 Camera: {product.specs?.camera || "—"}</li>
                </ul>

                <div className="mt-4">
                  {inCartQty > 0 ? (
                    <div className="qty-stepper" style={{ display: "inline-flex" }}>
                      <button className="qty-btn" onClick={() => addToCart(product, -1)}>−</button>
                      <span className="qty-value">{inCartQty}</span>
                      <button className="qty-btn" onClick={() => addToCart(product, 1)}>+</button>
                      <span className="qty-confirmed">In cart</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <select
                        value={pickQty}
                        onChange={(e) => setPickQty(Number(e.target.value))}
                        style={{ borderRadius: 10, border: "1px solid var(--border)", padding: "10px 12px" }}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <button
                        className="btn-add-cart"
                        onClick={() => {
                          addToCart(product, pickQty);
                          showToast(`Added ${pickQty} × ${product.name} to cart`);
                        }}
                      >
                        🛒 Add to cart
                      </button>
                    </div>
                  )}
                </div>

                <Link to="/all-products" className="btn-ghost mt-3" style={{ display: "inline-block", marginTop: 16 }}>
                  ← Back to products
                </Link>
              </div>
            </div>

            <ProductReviews productId={product._id} fallbackRating={product.rating ?? 4.3} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="tn-section">
          <div className="tn-section-head">
            <div>
              <span className="tn-section-eyebrow">You might also like</span>
              <h2 style={{ fontSize: 22 }}>More from {product.brand}</h2>
            </div>
          </div>
          <div className="products-grid">
            {related.map((m) => (
              <ProductCard key={m._id} mobile={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;