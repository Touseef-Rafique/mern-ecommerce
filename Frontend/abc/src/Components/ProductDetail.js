import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_ROOT = "https://mern-ecommerce-rmt9.onrender.com";

const ProductDetail = () => {
  const { id } = useParams();
  const [mobile, setMobile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMobile = async () => {
      try {
        const res = await fetch(`${API_ROOT}/api/mobiles/${id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await res.json();
        setMobile(data);
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
      <div style={{ padding: 30 }}>
        <h3>Loading product...</h3>
      </div>
    );
  }

  if (error || !mobile) {
    return (
      <div style={{ padding: 30 }}>
        <h3>{error || "Product not found"}</h3>
      </div>
    );
  }

  const imgSrc = mobile.image
    ? mobile.image.startsWith("http")
      ? mobile.image
      : `${API_ROOT}/${mobile.image}`
    : "https://via.placeholder.com/300?text=No+Image";

  return (
    <div
      style={{
        display: "flex",
        gap: 30,
        padding: 30,
        flexWrap: "wrap",
      }}
    >
      {/* IMAGE */}
      <div>
        <img
          src={imgSrc}
          alt={mobile.name}
          style={{
            width: 350,
            borderRadius: 10,
            objectFit: "contain",
          }}
        />
      </div>

      {/* DETAILS */}
      <div style={{ maxWidth: 500 }}>
        <h2>{mobile.name}</h2>

        <h3 style={{ color: "green" }}>
          {mobile.price?.toLocaleString()} PKR
        </h3>

        <p><b>Brand:</b> {mobile.brand}</p>

        <p><b>RAM:</b> {mobile.specs?.ram}</p>
        <p><b>Storage:</b> {mobile.specs?.storage}</p>
        <p><b>Battery:</b> {mobile.specs?.battery}</p>
        <p><b>Camera:</b> {mobile.specs?.camera}</p>
      </div>
    </div>
  );
};

export default ProductDetail;