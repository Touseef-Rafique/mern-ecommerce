import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";

const API_ROOT = "https://mern-ecommerce-rmt9.onrender.com";

const ProductCard = ({ mobile }) => {
  const { cartMap, addToCart } = useCart();
  const { showToast } = useToast();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isComparing, toggleCompare, canAddMore } = useCompare();

  const inCartQty = cartMap[mobile._id] || 0;
  const wishlisted = isWishlisted(mobile._id);
  const comparing = isComparing(mobile._id);
  const rating = mobile.rating ?? 4.3;
  const reviewCount = mobile.reviewCount ?? 0;

  const imgSrc = mobile.image
    ? mobile.image.startsWith("http")
      ? mobile.image
      : `${API_ROOT}/${mobile.image}`
    : "https://via.placeholder.com/300?text=Technest";

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(mobile);
    showToast(
      wishlisted ? `Removed ${mobile.name} from wishlist` : `Saved ${mobile.name} to wishlist`,
      "info"
    );
  };

  const handleCompare = (e) => {
    e.stopPropagation();
    if (!comparing && !canAddMore) {
      showToast("You can compare up to 3 phones at once", "error");
      return;
    }
    toggleCompare(mobile);
  };

  const renderStars = (value) => {
    const full = Math.round(value);
    return "★".repeat(full) + "☆".repeat(5 - full);
  };

  return (
    <div className="product-card mobile-card">
      <Link to={`/product-detail/${mobile._id}`} style={{ display: "block" }}>
        <div className="product-card-media">
          <button
            type="button"
            className={`card-wishlist-btn ${wishlisted ? "is-active" : ""}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          >
            {wishlisted ? "♥" : "♡"}
          </button>
          <span className="price-tag">{mobile.price?.toLocaleString()} PKR</span>
          <img src={imgSrc} alt={mobile.name} className="mobile-image" />
        </div>

        <div className="product-card-body">
          <h3 className="product-card-title">{mobile.name}</h3>
          <div className="spec-strip">
            {mobile.specs?.ram || "—"} RAM<span className="spec-dot">●</span>
            {mobile.specs?.storage || "—"}<span className="spec-dot">●</span>
            {mobile.specs?.battery || "—"}
          </div>
          <div className="card-rating">
            <span className="stars">{renderStars(rating)}</span>
            <span>{rating.toFixed(1)}{reviewCount > 0 ? ` (${reviewCount})` : ""}</span>
          </div>
        </div>
      </Link>

      <div className="product-card-body" style={{ paddingTop: 0 }}>
        <div className="product-card-actions">
          <label
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}
            onClick={handleCompare}
          >
            <input type="checkbox" checked={comparing} onChange={() => {}} style={{ accentColor: "var(--circuit)" }} />
            Compare
          </label>

          {inCartQty > 0 ? (
            <div className="qty-stepper cart-control-sm">
              <button className="qty-btn" onClick={() => addToCart(mobile, -1)}>−</button>
              <span className="qty-value">{inCartQty}</span>
              <button className="qty-btn" onClick={() => addToCart(mobile, 1)}>+</button>
            </div>
          ) : (
            <button
              className="btn-add-cart cart-control-sm"
              onClick={() => {
                addToCart(mobile, 1);
                showToast(`Added ${mobile.name} to cart`);
              }}
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;