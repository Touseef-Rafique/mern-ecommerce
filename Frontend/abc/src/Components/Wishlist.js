import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "./ProductCard";

const Wishlist = () => {
  const { wishlist } = useWishlist();

  return (
    <div className="products-container">
      <h2 className="title">Your Wishlist</h2>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <h4>Your wishlist is empty</h4>
          <p>Tap the ♡ on any phone to save it here for later.</p>
          <Link to="/all-products" className="btn-add-cart" style={{ display: "inline-block", marginTop: 16 }}>
            Browse phones
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {wishlist.map((mobile) => (
            <ProductCard key={mobile._id} mobile={mobile} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;