import { useState, useEffect } from "react";
import "../styles/styles.css";
import { useToast } from "../context/ToastContext";

const API_ROOT = "https://mern-ecommerce-rmt9.onrender.com";

const AdminUpdateProduct = () => {
  const { showToast } = useToast();

  const [mobiles, setMobiles] = useState([]);
  const [status, setStatus] = useState("loading"); 
  const [selectedId, setSelectedId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

const [ram, setRam] = useState("");
const [storage, setStorage] = useState("");
const [battery, setBattery] = useState("");
const [camera, setCamera] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  
  useEffect(() => {
    setStatus("loading");
    fetch(`${API_ROOT}/api/mobiles`)
      .then((res) => res.json())
      .then((data) => {
        setMobiles(data);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Error fetching mobiles:", err);
        setStatus("error");
      });
  }, []);

  const selectedProduct = mobiles.find((m) => m._id === selectedId);

  
  const handleSelectProduct = (id) => {
  setSelectedId(id);

  const product = mobiles.find((m) => m._id === id);

  setNewName(product?.name || "");
  setNewPrice(product?.price || "");

  setRam(product?.specs?.ram || "");
  setStorage(product?.specs?.storage || "");
  setBattery(product?.specs?.battery || "");
  setCamera(product?.specs?.camera || "");

  setNewImageFile(null);
  setPreviewUrl(null);
};
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const currentImageSrc = (product) => {
    if (!product?.image) return "https://via.placeholder.com/220?text=No+Image";
    return product.image.startsWith("http")
      ? product.image
      : `${API_ROOT}/${product.image}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedId) {
      showToast("Pehle koi product select karein", "error");
      return;
    }

    const formData = new FormData();

formData.append("name", newName);
formData.append("price", newPrice);

formData.append("ram", ram);
formData.append("storage", storage);
formData.append("battery", battery);
formData.append("camera", camera);

if (newImageFile) {
  formData.append("image", newImageFile);
}
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_ROOT}/api/mobiles/${selectedId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, 
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const updated = await res.json();

      
      setMobiles((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      );
      setNewImageFile(null);
      setPreviewUrl(null);
      showToast(`${updated.name} updated✅`);
    } catch (err) {
      console.error("Update failed:", err);
      showToast("Update fail , try again", "error");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="products-container">
        <h2 className="title">Admin · Update Product</h2>
        <div className="skeleton-card" style={{ maxWidth: 500, height: 240, margin: "0 auto" }} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="products-container">
        <h2 className="title">Admin · Update Product</h2>
        <div className="empty-state">
          <h4>Products not</h4>
          <p>Backend check (https://mern-ecommerce-rmt9.onrender.com) page refresh. </p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container" style={{ maxWidth: 560 }}>
      <h2 className="title">Admin · Update Product</h2>

      <div className="card shadow-sm p-4" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)" }}>
        <div className="mb-3">
          <label className="form-label fw-bold">Product select</label>
          <select
            className="form-select"
            value={selectedId}
            onChange={(e) => handleSelectProduct(e.target.value)}
            style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", width: "100%" }}
          >
            <option value="">-- Phone select --</option>
            {mobiles.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.brand})
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Current image</p>
                <img
                  src={currentImageSrc(selectedProduct)}
                  alt={selectedProduct.name}
                  style={{ width: 140, height: 140, objectFit: "contain", border: "1px solid var(--line)", borderRadius: 10, padding: 8, background: "#fafaf7" }}
                />
              </div>

              {previewUrl && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: "var(--circuit)", marginBottom: 6 }}>New image (preview)</p>
                  <img
                    src={previewUrl}
                    alt="New preview"
                    style={{ width: 140, height: 140, objectFit: "contain", border: "1px solid var(--circuit)", borderRadius: 10, padding: 8, background: "#fafaf7" }}
                  />
                </div>
              )}
            </div>

            
            <div className="mb-3">
  <label className="form-label fw-bold">Product name</label>
  <input
    type="text"
    className="form-control"
    value={newName}
    onChange={(e) => setNewName(e.target.value)}
    style={{
      border: "1px solid var(--line)",
      borderRadius: 10,
      padding: "10px 12px",
      width: "100%",
    }}
  />
</div>
<div className="mb-3">
  <label className="form-label fw-bold">Price</label>
  <input
    type="number"
    className="form-control"
    value={newPrice}
    onChange={(e) => setNewPrice(e.target.value)}
    style={{
      border: "1px solid var(--line)",
      borderRadius: 10,
      padding: "10px 12px",
      width: "100%",
    }}
  />
</div>

<div className="mb-3">
  <label className="form-label fw-bold">RAM</label>
  <input
    type="text"
    className="form-control"
    value={ram}
    onChange={(e) => setRam(e.target.value)}
  />
</div>

<div className="mb-3">
  <label className="form-label fw-bold">Storage</label>
  <input
    type="text"
    className="form-control"
    value={storage}
    onChange={(e) => setStorage(e.target.value)}
  />
</div>

<div className="mb-3">
  <label className="form-label fw-bold">Battery</label>
  <input
    type="text"
    className="form-control"
    value={battery}
    onChange={(e) => setBattery(e.target.value)}
  />
</div>

<div className="mb-3">
  <label className="form-label fw-bold">Camera</label>
  <input
    type="text"
    className="form-control"
    value={camera}
    onChange={(e) => setCamera(e.target.value)}
  />
</div>





            <div className="mb-3">
              <label className="form-label fw-bold">New image upload please</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "block", width: "100%" }}
              />
            </div>

            <button
              type="submit"
              className="btn-add-cart"
              style={{ width: "100%" }}
              disabled={saving}
            >
              {saving ? "Update ho raha hai…" : "Update karein"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminUpdateProduct;