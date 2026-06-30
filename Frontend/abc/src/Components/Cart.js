import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, setQuantity, removeItem, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="container mt-5" style={{ paddingBottom: 60 }}>
      <h2 className="title">🛒 Your Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-state">
          <h4>Your cart is empty</h4>
          <Link to="/all-products" className="btn-add-cart" style={{ display: "inline-block", marginTop: 16 }}>
            🛍 Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-col">
            {cart.map((item) => (
              <div key={item._id} className="card mb-3 shadow-sm" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)" }}>
                <div className="row g-0">
                  <div className="col-md-3 d-flex align-items-center">
                    <img
                      src={
                        item.image?.startsWith("http")
                          ? item.image
                          : `https://mern-ecommerce-rmt9.onrender.com/${item.image}`
                      }
                      className="img-fluid rounded p-2"
                      style={{ maxHeight: "160px", objectFit: "contain" }}
                      alt={item.name}
                    />
                  </div>

                  <div className="col-md-6">
                    <div className="card-body">
                      <h5>{item.name}</h5>
                      <p className="text-muted" style={{ textTransform: "capitalize" }}>Brand: {item.brand || "N/A"}</p>

                      <h6 style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                        {item.price.toLocaleString()} PKR each
                      </h6>

                      <h6 style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        Total: {(item.price * item.quantity).toLocaleString()} PKR
                      </h6>

                      <div className="qty-stepper cart-control-sm" style={{ display: "inline-flex", marginTop: 8 }}>
                        <button className="qty-btn" onClick={() => setQuantity(item._id, item.quantity - 1)}>−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => setQuantity(item._id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 d-flex align-items-center justify-content-center">
                    <button className="btn-ghost" onClick={() => removeItem(item._id)}>
                      ✕ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-col">
            <div className="order-summary-card">
              <h4 className="text-center" style={{ marginTop: 0 }}>Cart Summary</h4>
              <hr />

              <div className="order-summary-item">
                <span className="name">Total Items</span>
                <span className="meta">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>

              <div className="order-summary-item" style={{ borderBottom: "none" }}>
                <span className="name" style={{ fontWeight: 700 }}>Grand Total</span>
                <span className="meta" style={{ fontSize: 16, color: "var(--ink)" }}>
                  {totalPrice.toLocaleString()} PKR
                </span>
              </div>

              <button
                className="btn-add-cart"
                style={{ width: "100%", marginTop: 16 }}
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout →
              </button>

              <Link
                to="/all-products"
                className="btn-ghost"
                style={{ width: "100%", marginTop: 10, textAlign: "center", display: "block" }}
              >
                🔙 Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;