import { Link, useNavigate } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const API_ROOT = "http://localhost:5000";

const SPEC_ROWS = [
  { key: "price", label: "Price", format: (v) => (v != null ? `${v.toLocaleString()} PKR` : "—") },
  { key: "brand", label: "Brand", format: (v) => v || "—" },
  { key: "ram", label: "RAM", spec: true },
  { key: "storage", label: "Storage", spec: true },
  { key: "battery", label: "Battery", spec: true },
  { key: "camera", label: "Camera", spec: true },
];

const Compare = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (compareList.length === 0) {
    return (
      <div className="container mt-5">
        <div className="empty-state">
          <h4>Nothing to compare yet</h4>
          <p>Pick 2–3 phones using the "Compare" checkbox on any product card.</p>
          <Link to="/all-products" className="btn-add-cart" style={{ display: "inline-block", marginTop: 16 }}>
            Browse phones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ paddingBottom: 60 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <h2 className="title" style={{ margin: 0, textAlign: "left" }}>Compare phones</h2>
        <button className="btn-ghost" onClick={clearCompare}>Clear all</button>
      </div>

      <div className="tn-compare-table-wrap">
        <table className="tn-compare-table">
          <thead>
            <tr>
              <th style={{ background: "var(--surface)" }}></th>
              {compareList.map((p) => (
                <th key={p._id} className="compare-head-cell">
                  <img
                    src={p.image ? (p.image.startsWith("http") ? p.image : `${API_ROOT}/${p.image}`) : "https://via.placeholder.com/100?text=Technest"}
                    alt={p.name}
                  />
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--ink)", marginBottom: 8, textTransform: "none" }}>
                    {p.name}
                  </div>
                  <button
                    className="btn-add-cart cart-control-sm"
                    onClick={() => {
                      addToCart(p, 1);
                      showToast(`Added ${p.name} to cart`);
                    }}
                  >
                    Add to cart
                  </button>
                  <div>
                    <button
                      className="btn-ghost"
                      style={{ marginTop: 8, fontSize: 12, padding: "6px 10px" }}
                      onClick={() => removeFromCompare(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEC_ROWS.map((row) => (
              <tr key={row.key}>
                <th>{row.label}</th>
                {compareList.map((p) => {
                  const raw = row.spec ? p.specs?.[row.key] : p[row.key];
                  return (
                    <td key={p._id} className="spec-value">
                      {row.format ? row.format(row.spec ? raw : p[row.key]) : raw || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn-ghost" onClick={() => navigate("/all-products")}>
          ← Back to all products
        </button>
      </div>
    </div>
  );
};

export default Compare;