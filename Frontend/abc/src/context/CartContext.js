import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "cart";

function readCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // addToCart(product, delta) — delta can be positive (add/increment) or
  // negative (decrement). If quantity would drop to 0, the item is removed.
  const addToCart = useCallback((product, delta = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);

      if (!existing) {
        if (delta <= 0) return prev;
        return [...prev, { ...product, quantity: delta }];
      }

      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        return prev.filter((item) => item._id !== product._id);
      }
      return prev.map((item) =>
        item._id === product._id ? { ...item, quantity: nextQty } : item
      );
    });
  }, []);

  const setQuantity = useCallback((id, quantity) => {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((item) => item._id !== id);
      return prev.map((item) => (item._id === id ? { ...item, quantity } : item));
    });
  }, []);

  const removeItem = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartMap = useMemo(() => {
    const map = {};
    cart.forEach((item) => {
      map[item._id] = item.quantity;
    });
    return map;
  }, [cart]);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const value = {
    cart,
    cartMap,
    totalItems,
    totalPrice,
    addToCart,
    setQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};