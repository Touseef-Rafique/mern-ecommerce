import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const MainNav = ({ setIsAuthenticated }) => {
  const { totalItems } = useCart();
  const { totalWishlist } = useWishlist();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const isActive = (path) => location.pathname.startsWith(path);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/all-products?search=${encodeURIComponent(q)}` : "/all-products");
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    setIsAuthenticated(false);
  };

  const go = () => setMenuOpen(false);

  return (
    <>
      <div className="tn-topbar">
        <div className="container-fluid">
          <span>🚚 Free delivery on orders over 50,000 PKR</span>
          <span className="dot-sep">●</span>
          <span>✅ 100% PTA-approved devices</span>
          <span className="dot-sep">●</span>
          <span>↩ 7-day easy returns</span>
        </div>
      </div>

      <nav className="tn-nav">
        <div className="container-fluid">
          <Link className="tn-brand" to="/home" onClick={go}>
            Technest<span className="dot">.</span>
          </Link>

          <form className="tn-search" onSubmit={handleSearch} role="search">
            <input
              type="search"
              placeholder="Search phones, brands…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search phones"
            />
          </form>

          <ul className="tn-links">
            <li>
              <Link className={`tn-link ${isActive("/all-products") || isActive("/product") ? "active" : ""}`} to="/all-products">
                Products
              </Link>
            </li>
            <li>
              <Link className={`tn-link ${isActive("/home") ? "active" : ""}`} to="/home">
                About
              </Link>
            </li>
            <li>
              <Link className={`tn-link ${isActive("/wishlist") ? "active" : ""}`} to="/wishlist">
                Wishlist
                {totalWishlist > 0 && <span className="tn-wishlist-badge">{totalWishlist}</span>}
              </Link>
            </li>
            <li>
              <Link className={`tn-link ${isActive("/cart") ? "active" : ""}`} to="/cart">
                Cart
                {totalItems > 0 && <span className="tn-cart-badge">{totalItems}</span>}
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link className={`tn-link ${isActive("/admin") ? "active" : ""}`} to="/admin">
                  Admin
                </Link>
              </li>
            )}
            <li>
              <button className="tn-logout" onClick={handleLogout}>
                Log out
              </button>
            </li>
          </ul>

          <button
            className="tn-nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`tn-mobile-menu ${menuOpen ? "is-open" : ""}`}>
            <ul>
              <li>
                <Link className="tn-link" to="/all-products" onClick={go}>
                  Products {isActive("/all-products") && <span>•</span>}
                </Link>
              </li>
              <li>
                <Link className="tn-link" to="/home" onClick={go}>
                  About
                </Link>
              </li>
              <li>
                <Link className="tn-link" to="/wishlist" onClick={go}>
                  Wishlist {totalWishlist > 0 && <span className="tn-wishlist-badge">{totalWishlist}</span>}
                </Link>
              </li>
              <li>
                <Link className="tn-link" to="/cart" onClick={go}>
                  Cart {totalItems > 0 && <span className="tn-cart-badge">{totalItems}</span>}
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link className="tn-link" to="/admin" onClick={go}>
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <button className="tn-logout" onClick={handleLogout}>
                  Log out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MainNav;