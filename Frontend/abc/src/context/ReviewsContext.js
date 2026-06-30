import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ReviewsContext = createContext(null);
const STORAGE_KEY = "reviews";

function readReviews() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

export const ReviewsProvider = ({ children }) => {
  const [reviewsByProduct, setReviewsByProduct] = useState(readReviews);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviewsByProduct));
  }, [reviewsByProduct]);

  const getReviews = useCallback(
    (productId) => reviewsByProduct[productId] || [],
    [reviewsByProduct]
  );

  const addReview = useCallback((productId, review) => {
    setReviewsByProduct((prev) => {
      const existing = prev[productId] || [];
      const newReview = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: new Date().toISOString(),
        ...review,
      };
      return { ...prev, [productId]: [newReview, ...existing] };
    });
  }, []);

  const value = { getReviews, addReview };

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
};

export const useReviews = () => {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used within a ReviewsProvider");
  return ctx;
};