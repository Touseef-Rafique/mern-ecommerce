import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    province: "",
    division: "",
    district: "",
    tehseel: "",
    location: "",
    block: "",
    houseNumber: "",
    name: "",
    fatherName: "",
    cnic: "",
    phone1: "",
    phone2: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const validate = () => {
    const required = ["province", "district", "name", "phone1"];
    const next = {};
    required.forEach((field) => {
      if (!formData[field]?.trim()) next[field] = "This field is required";
    });
    if (formData.phone1 && formData.phone1.trim().length < 10) {
      next.phone1 = "Enter a valid phone number";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast("Your cart is empty", "error");
      navigate("/all-products");
      return;
    }
    if (!validate()) {
      showToast("Please fill in the required fields", "error");
      return;
    }

    setIsSubmitted(true);
    clearCart();

    setTimeout(() => {
      navigate("/all-products");
    }, 2200);
  };

  return (
    <div className="container mt-5" style={{ paddingBottom: 60 }}>
      {!isSubmitted && (
        <div className="checkout-progress">
          <div className="step is-done">1. Cart</div>
          <div className="step is-active">2. Address & details</div>
          <div className="step">3. Confirmation</div>
        </div>
      )}

      <div className="card shadow-lg p-4" style={{ border: "none", borderRadius: "var(--radius)" }}>
        {isSubmitted ? (
          <div className="text-center">
            <h1 style={{ color: "var(--circuit)" }}>✅ Order Confirmed!</h1>
            <p className="text-muted">Thanks for shopping with Technest. Redirecting you back to the catalog…</p>
          </div>
        ) : (
          <div className="checkout-grid">
            <div>
              <h1 className="text-center" style={{ fontSize: 22 }}>📍 Delivery & order details</h1>

              <form onSubmit={handleSubmit}>
                <h3 className="mt-3" style={{ fontSize: 17, color: "var(--circuit)" }}>Address Information</h3>

                <div className="mb-3">
                  <label htmlFor="province" className="form-label fw-bold">Select Your Province</label>
                  <select
                    id="province"
                    name="province"
                    className={`form-select ${errors.province ? "is-invalid" : ""}`}
                    onChange={handleChange}
                    value={formData.province}
                  >
                    <option disabled value="">Select Province</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Gilgit Baltistan">Gilgit Baltistan</option>
                    <option value="FATA">FATA</option>
                    <option value="Azad Kashmir">Azad Kashmir</option>
                  </select>
                  {errors.province && <div className="field-error">{errors.province}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Division Name</label>
                    <input type="text" name="division" className="form-control" placeholder="Enter your Division" onChange={handleChange} value={formData.division} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">District Name</label>
                    <input
                      type="text"
                      name="district"
                      className={`form-control ${errors.district ? "is-invalid" : ""}`}
                      placeholder="Enter your District"
                      onChange={handleChange}
                      value={formData.district}
                    />
                    {errors.district && <div className="field-error">{errors.district}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Tehseel Name</label>
                    <input type="text" name="tehseel" className="form-control" placeholder="Enter your Tehseel" onChange={handleChange} value={formData.tehseel} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Colony/Town/Society Name</label>
                    <input type="text" name="location" className="form-control" placeholder="Enter your Colony/Town/Society" onChange={handleChange} value={formData.location} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Block/Section/Sector Name</label>
                    <input type="text" name="block" className="form-control" placeholder="Enter your Block/Section/Sector" onChange={handleChange} value={formData.block} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">House Number</label>
                    <input type="text" name="houseNumber" className="form-control" placeholder="Enter your House Number" onChange={handleChange} value={formData.houseNumber} />
                  </div>
                </div>

                <h3 className="mt-4" style={{ fontSize: 17, color: "var(--circuit)" }}>Personal Information</h3>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      placeholder="Enter your Name"
                      onChange={handleChange}
                      value={formData.name}
                    />
                    {errors.name && <div className="field-error">{errors.name}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Father's Name</label>
                    <input type="text" name="fatherName" className="form-control" placeholder="Enter Father's Name" onChange={handleChange} value={formData.fatherName} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">CNIC</label>
                  <input type="text" inputMode="numeric" name="cnic" className="form-control" placeholder="Enter CNIC (without dashes)" onChange={handleChange} value={formData.cnic} />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Phone Number 1</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="phone1"
                      className={`form-control ${errors.phone1 ? "is-invalid" : ""}`}
                      placeholder="Enter your Primary Phone Number"
                      onChange={handleChange}
                      value={formData.phone1}
                    />
                    {errors.phone1 && <div className="field-error">{errors.phone1}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Phone Number 2</label>
                    <input type="text" inputMode="numeric" name="phone2" className="form-control" placeholder="Enter your Secondary Phone Number (Optional)" onChange={handleChange} value={formData.phone2} />
                  </div>
                </div>

                <div className="mt-4">
                  <button type="submit" className="btn-add-cart" style={{ width: "100%" }}>
                    Place order — {totalPrice.toLocaleString()} PKR
                  </button>
                </div>
              </form>
            </div>

            <div className="order-summary-card">
              <h5 style={{ marginTop: 0 }}>Order Summary</h5>
              {cart.length === 0 ? (
                <p className="text-muted" style={{ fontSize: 14 }}>
                  Your cart is empty. <Link to="/all-products">Browse phones</Link>
                </p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item._id} className="order-summary-item">
                      <span className="name">{item.name} × {item.quantity}</span>
                      <span className="meta">{(item.price * item.quantity).toLocaleString()} PKR</span>
                    </div>
                  ))}
                  <div className="order-summary-item" style={{ borderBottom: "none", marginTop: 8 }}>
                    <span className="name" style={{ fontWeight: 700 }}>Total</span>
                    <span className="meta" style={{ fontSize: 16, color: "var(--ink)" }}>
                      {totalPrice.toLocaleString()} PKR
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;