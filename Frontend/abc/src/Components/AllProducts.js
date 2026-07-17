import { useState, useEffect, useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/styles.css";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";

const API_ROOT = "https://mern-ecommerce-rmt9.onrender.com";

const AllProducts = () => {
  const [mobiles, setMobiles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [status, setStatus] = useState("loading");
  const [sortBy, setSortBy] = useState("default");
  const [activeBrand, setActiveBrand] = useState("all");
  const [maxPrice, setMaxPrice] = useState(500000);
  const [priceCeiling, setPriceCeiling] = useState(500000);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    setStatus("loading");
    fetch(`${API_ROOT}/api/mobiles`)
      .then((res) => res.json())
      .then((data) => {
        const cleaned = data.map((m) => ({
          ...m,
          brand: m.brand ? m.brand.toLowerCase().trim() : "unknown",
        }));
        setMobiles(cleaned);
        setBrands([...new Set(cleaned.map((m) => m.brand))].sort());
        const highest = cleaned.reduce((max, m) => Math.max(max, m.price || 0), 0);
        const rounded = Math.max(10000, Math.ceil((highest || 500000) / 10000) * 10000);
        setPriceCeiling(rounded);
        setMaxPrice(rounded);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Error fetching mobiles:", err);
        setStatus("error");
      });
  }, []);

  const isFiltering = Boolean(search.trim()) || activeBrand !== "all" || maxPrice < priceCeiling;

  const filtered = useMemo(() => {
    if (!isFiltering) return null;
    const q = search.trim().toLowerCase();
    return mobiles.filter((m) => {
      const matchesSearch = !q || m.name?.toLowerCase().includes(q) || m.brand?.includes(q);
      const matchesBrand = activeBrand === "all" || m.brand === activeBrand;
      const matchesPrice = (m.price || 0) <= maxPrice;
      return matchesSearch && matchesBrand && matchesPrice;
    });
  }, [mobiles, search, activeBrand, maxPrice, isFiltering]);

  const sorted = useMemo(() => {
    const list = filtered ? [...filtered] : null;
    if (!list) return null;
    if (sortBy === "price-asc") return list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") return list.sort((a, b) => b.price - a.price);
    return list;
  }, [filtered, sortBy]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  const clearFilters = () => {
    setActiveBrand("all");
    setMaxPrice(priceCeiling);
    setSearchParams({});
  };

  return (
    <div className="A">
      <div className="products-container T">
        <h2 className="title">Mobile Phones</h2>

        <div className="tn-filter-rail">
          <h5>Brand</h5>
          <div className="tn-chip-row" style={{ marginBottom: 16 }}>
            <button
              className={`tn-chip ${activeBrand === "all" ? "is-active" : ""}`}
              onClick={() => setActiveBrand("all")}
            >
              All brands
            </button>
            {brands.map((b) => (
              <button
                key={b}
                className={`tn-chip ${activeBrand === b ? "is-active" : ""}`}
                onClick={() => setActiveBrand(b)}
                style={{ textTransform: "capitalize" }}
              >
                {b}
              </button>
            ))}
          </div>

          <h5>Max price</h5>
          <div className="tn-price-range">
            <input
              type="range"
              min={0}
              max={priceCeiling}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <span className="val">{maxPrice.toLocaleString()} PKR</span>
          </div>
        </div>

        <div className="toolbar">
          <div className="toolbar-group">
            <input
              type="text"
              placeholder="Search by name or brand…"
              value={search}
              onChange={(e) => {
                const v = e.target.value;
                setSearchParams(v ? { search: v } : {});
              }}
            />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            {isFiltering && (
              <button className="btn-ghost" onClick={clearFilters}>Clear filters</button>
            )}
          </div>
          {sorted && (
            <span className="result-count">{sorted.length} result{sorted.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {status === "loading" && (
          <div className="skeleton-row">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="skeleton-card" key={i} />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="empty-state">
            <h4>We couldn't load the catalog</h4>
            <p>Check your connection and try refreshing the page.</p>
          </div>
        )}

        {status === "ready" && sorted && (
          sorted.length > 0 ? (
            <div className="products-grid">
              {sorted.map((mobile) => (
                <ProductCard key={mobile._id} mobile={mobile} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h4>No phones match your filters</h4>
              <p>Try a different brand, search term, or widen the price range.</p>
            </div>
          )
        )}

        {status === "ready" && !sorted &&
          brands.map((brand) => (
            <div key={brand} className="brand-section">
              <div style={{ textAlign: "center" }}>
                <h3 className="brand-title">{brand.toUpperCase()} Mobiles</h3>
              </div>

              <div style={{ textAlign: "right" }}>
                <Link to={`/product/${brand}`} className="btn-ghost">
                  View all →
                </Link>
              </div>

              <Slider {...settings}>
                {mobiles
                  .filter((mobile) => mobile.brand === brand)
                  .map((mobile) => (
                    <div key={mobile._id} style={{ padding: "0 8px" }}>
                      <ProductCard mobile={mobile} />
                    </div>
                  ))}
              </Slider>
            </div>
          ))}
      </div>

      <footer className="footer A py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4 footer-column">
              <h5>About</h5>
              <ul className="list-unstyled">
                <li><button className="btn">About Us</button></li>
                <li><button className="btn">FAQs</button></li>
                <li><button className="btn">Contact Us</button></li>
                <li><button className="btn">Career</button></li>
              </ul>
            </div>

            <div className="col-md-4 footer-column">
              <h5>Customer Services</h5>
              <ul className="list-unstyled">
                <li><button className="btn">Help Center</button></li>
                <li><button className="btn">Privacy Policy</button></li>
                <li><button className="btn">Installment Plan</button></li>
              </ul>
            </div>

            <div className="col-md-4 footer-column">
              <h5>Secure Payment Methods</h5>
              <p style={{ color: "rgba(255,255,255,0.75)" }}>
                We support secure payment methods for safe transactions.
              </p>
            </div>
          </div>

          <div className="text-center footer-bottom">
            <p style={{ color: "rgba(255,255,255,0.6)", margin: 0 }}>
              © 2026 Technest | All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AllProducts;