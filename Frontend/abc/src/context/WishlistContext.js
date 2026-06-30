import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "wishlist";

function readWishlist() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(readWishlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const isWishlisted = useCallback(
    (id) => wishlist.some((item) => item._id === id),
    [wishlist]
  );

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (exists) return prev.filter((item) => item._id !== product._id);
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((id) => {
    setWishlist((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const totalWishlist = useMemo(() => wishlist.length, [wishlist]);

  const value = { wishlist, isWishlisted, toggleWishlist, removeFromWishlist, totalWishlist };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
};