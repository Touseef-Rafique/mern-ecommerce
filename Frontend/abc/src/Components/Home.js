import React from "react";
import { Link } from "react-router-dom";

const brands = [
  { name: "Samsung", src: "https://static.priceoye.pk/images/brands/svg/samsung.svg" },
  { name: "Apple", src: "https://static.priceoye.pk/images/brands/svg/apple.svg" },
  { name: "Xiaomi", src: "https://static.priceoye.pk/images/brands/svg/xiaomi.svg" },
  { name: "Oppo", src: "https://static.priceoye.pk/images/brands/svg/oppo.svg" },
  { name: "Vivo", src: "https://static.priceoye.pk/images/brands/svg/vivo.svg" },
  { name: "Realme", src: "https://static.priceoye.pk/images/brands/svg/realme.svg" },
];

function Home() {
  return (
    <>
      {/* ===== Hero: the spec-strip thesis ===== */}
      <section className="tn-hero">
        <div className="container">
          <div className="tn-hero-grid">
            <div>
              <span className="tn-eyebrow">Live catalog · Pakistan-wide delivery</span>
              <h1>
                Every spec. <br />Every price. <em>One place.</em>
              </h1>
              <p className="lede">
                Technest lines up real specs against real prices — no guesswork, no
                inflated "deals." Compare phones side by side and check out in minutes.
              </p>
              <div className="tn-hero-ctas">
                <Link to="/all-products" className="btn-add-cart">Browse all phones</Link>
                <Link to="/all-products" className="btn-ghost">Compare top picks →</Link>
              </div>
              <div className="tn-stat-row">
                <div className="tn-stat">
                  <span className="num">6+</span>
                  <span className="label">Brands stocked</span>
                </div>
                <div className="tn-stat">
                  <span className="num">PTA</span>
                  <span className="label">Approved only</span>
                </div>
                <div className="tn-stat">
                  <span className="num">2–4d</span>
                  <span className="label">Avg. delivery</span>
                </div>
              </div>
            </div>

            <div className="tn-hero-visual">
              <div className="spec-card sc-back">
                <div className="sc-name">Galaxy S-Series</div>
                <div className="sc-price">189,999 PKR</div>
                <div className="sc-row"><span>RAM</span><span>12GB</span></div>
                <div className="sc-row"><span>Storage</span><span>256GB</span></div>
                <div className="sc-row"><span>Battery</span><span>5000mAh</span></div>
              </div>
              <div className="spec-card sc-front">
                <div className="sc-name">iPhone 16</div>
                <div className="sc-price">329,999 PKR</div>
                <div className="sc-row"><span>RAM</span><span>8GB</span></div>
                <div className="sc-row"><span>Storage</span><span>128GB</span></div>
                <div className="sc-row"><span>Camera</span><span>48MP</span></div>
              </div>
            </div>
          </div>

          <div className="tn-hero-marquee">
            <div className="tn-hero-marquee-track">
              {[...brands, ...brands].map((b, i) => (
                <span key={i}><span className="brand-name">{b.name}</span> · in stock now</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Why shop with us ===== */}
      <section className="tn-why">
        <div className="container tn-why-grid">
          <div className="tn-why-item">
            <span className="tn-why-icon">🔍</span>
            <h4>Real spec comparisons</h4>
            <p>Stack up to 3 phones side by side before you buy.</p>
          </div>
          <div className="tn-why-item">
            <span className="tn-why-icon">🛡️</span>
            <h4>PTA-approved only</h4>
            <p>Every device works on Pakistani networks, guaranteed.</p>
          </div>
          <div className="tn-why-item">
            <span className="tn-why-icon">🚚</span>
            <h4>Nationwide delivery</h4>
            <p>2–4 working days to most cities across Pakistan.</p>
          </div>
          <div className="tn-why-item">
            <span className="tn-why-icon">↩️</span>
            <h4>7-day easy returns</h4>
            <p>Changed your mind? Return it unused, no hassle.</p>
          </div>
        </div>
      </section>

      {/* ===== Brand rail ===== */}
      <section className="tn-section">
        <div className="container">
          <div className="tn-section-head">
            <div>
              <span className="tn-section-eyebrow">Shop by brand</span>
              <h2>Every major name, one catalog</h2>
            </div>
            <Link to="/all-products" className="btn-ghost">View all phones →</Link>
          </div>

          <div className="tn-brand-rail">
            {brands.map((brand) => (
              <Link key={brand.name} to={`/product/${brand.name.toLowerCase()}`} className="tn-brand-pill">
                <img src={brand.src} alt={brand.name} />
                <div className="name">{brand.name.toUpperCase()}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Editorial story ===== */}
      <section className="tn-section" style={{ paddingTop: 0 }}>
        <div className="container tn-story">
          <div>
            <span className="tn-section-eyebrow">Why specs matter</span>
            <h2>Built for people who actually read the spec sheet</h2>
            <p>
              Flashy marketing photos don't tell you whether a phone can last a full day
              on a single charge, or whether the camera holds up in low light. We put the
              numbers front and center — RAM, storage, battery, camera — right where you're
              already comparing prices, so you can decide with information instead of guesswork.
            </p>
            <p>
              Every listing on Technest pulls from the same live catalog used across search,
              comparison, and checkout — so the price you compare is the price you pay.
            </p>
          </div>
          <div className="tn-story-figure">
            <span className="big">15,000+</span>
            <span className="cap">Phones compared by shoppers this month</span>
            <div style={{ marginTop: 24 }}>
              <span className="big">4.6 / 5</span>
              <span className="cap">Average customer rating across the catalog</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Newsletter ===== */}
      <section className="tn-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="tn-signup-strip">
            <div>
              <h3>Get a heads-up on price drops</h3>
              <p>One email a week. No spam, unsubscribe any time.</p>
            </div>
            <form
              className="tn-signup-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input type="email" placeholder="you@example.com" required />
              <button type="submit" className="btn-primary-solid">Notify me</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer A">
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
    </>
  );
}

export default Home;