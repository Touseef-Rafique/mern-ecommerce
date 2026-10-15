import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../styles/styles.css";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { useToast } from "../context/ToastContext";
import { useReviews } from "../context/ReviewsContext";
import ProductReviews from "./ProductReviews";

const API_ROOT = "https://mern-ecommerce-rmt9.onrender.com";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { cartMap, addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isComparing, toggleCompare, canAddMore } = useCompare();
  const { showToast } = useToast();
  const { getReviews } = useReviews();

  useEffect(() => {
    const fetchMobile = async () => {
      try {
        const res = await fetch(`${API_ROOT}/api/mobiles/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        setMobile(await res.json());
      } catch (err) {
        console.error(err);
        setError("Product not found or server error");
      } finally {
        setLoading(false);
      }
    };
    fetchMobile();
  }, [id]);

  if (loading) {
    return (
      <div className="products-container">
        <div className="skeleton-row">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="skeleton-card" key={i} style={{ height: 420 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !mobile) {
    return (
      <div className="products-container pd-error">
        <h3>{error || "Product not found"}</h3>
        <p>The listing may have been removed. Browse the full catalog instead.</p>
        <Link to="/all-products" className="btn-add-cart" style={{ display: "inline-block" }}>
          Back to all products
        </Link>
      </div>
    );
  }

  const imgSrc = mobile.image
    ? mobile.image.startsWith("http")
      ? mobile.image
      : `${API_ROOT}/${mobile.image}`
    : "https://via.placeholder.com/400x400?text=No+Image";

  const wishlisted = isWishlisted(mobile._id);
  const comparing = isComparing(mobile._id);
  const inCartQty = cartMap[mobile._id] || 0;
  const reviews = getReviews(mobile._id);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : mobile.rating ?? 4.3;
  const reviewCount = reviews.length || mobile.reviewCount || 0;

  const handleWishlist = () => {
    toggleWishlist(mobile);
    showToast(wishlisted ? `Removed ${mobile.name} from wishlist` : `Saved ${mobile.name} to wishlist`, "info");
  };

  const handleCompare = () => {
    if (!comparing && !canAddMore) {
      showToast("You can compare up to 3 phones at once", "error");
      return;
    }
    toggleCompare(mobile);
    showToast(comparing ? `Removed ${mobile.name} from compare` : `Added ${mobile.name} to compare`, "info");
  };

  const specs = [
    ["Brand", mobile.brand],
    ["RAM", mobile.specs?.ram],
    ["Storage", mobile.specs?.storage],
    ["Battery", mobile.specs?.battery],
    ["Camera", mobile.specs?.camera],
  ].filter(([, v]) => v);

  return (
    <div className="products-container">
      <div className="pd-breadcrumb">
        <Link to="/all-products">All products</Link> /{" "}
        <Link to={`/product/${(mobile.brand || "").toLowerCase()}`} style={{ textTransform: "capitalize" }}>
          {mobile.brand}
        </Link>{" "}
        / {mobile.name}
      </div>

      <div className="pd-layout">
        <div className="pd-gallery">
          <img src={imgSrc} alt={mobile.name} />
        </div>

        <div>
          <span className="pd-brand">{mobile.brand} · PTA Approved</span>
          <h1 className="pd-title">{mobile.name}</h1>

          <div className="pd-rating">
            <span className="stars">
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </span>
            <span>
              {avgRating.toFixed(1)} · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>

          <div className="pd-price">{mobile.price?.toLocaleString()} PKR</div>
          <div className="pd-price-note">Inclusive of all taxes · Free delivery over 50,000 PKR</div>

          <table className="pd-spec-table">
            <tbody>
              {specs.map(([label, value]) => (
                <tr key={label}>
                  <th>{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pd-actions">
            {inCartQty > 0 ? (
              <div className="qty-stepper">
                <button className="qty-btn" onClick={() => addToCart(mobile, -1)} aria-label="Decrease quantity">
                  −
                </button>
                <span className="qty-value">{inCartQty}</span>
                <button className="qty-btn" onClick={() => addToCart(mobile, 1)} aria-label="Increase quantity">
                  +
                </button>
              </div>
            ) : (
              <button
                className="btn-add-cart"
                onClick={() => {
                  addToCart(mobile, 1);
                  showToast(`Added ${mobile.name} to cart`);
                }}
              >
                Add to cart
              </button>
            )}

            <button className={`btn-ghost ${wishlisted ? "is-active" : ""}`} onClick={handleWishlist}>
              {wishlisted ? "♥ Saved" : "♡ Wishlist"}
            </button>

            <button className="btn-ghost" onClick={handleCompare}>
              {comparing ? "✓ Comparing" : "⇄ Compare"}
            </button>

            {inCartQty > 0 && (
              <button className="btn-ghost" onClick={() => navigate("/cart")}>
                Go to cart →
              </button>
            )}
          </div>

          <div className="pd-perks">
            <span>7-day easy returns, no questions asked</span>
            <span>2–4 working days delivery nationwide</span>
            <span>100% PTA-approved, warranty included</span>
          </div>
        </div>
      </div>

      <ProductReviews productId={mobile._id} fallbackRating={mobile.rating ?? 4.3} />
    </div>
  );
};

export default ProductDetail;