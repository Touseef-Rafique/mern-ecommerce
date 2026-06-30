import { createContext, useContext, useState, useCallback, useMemo } from "react";

const CompareContext = createContext(null);
const MAX_COMPARE = 3;

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  const isComparing = useCallback(
    (id) => compareList.some((item) => item._id === id),
    [compareList]
  );

  const toggleCompare = useCallback((product) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (exists) return prev.filter((item) => item._id !== product._id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((id) => {
    setCompareList((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const clearCompare = useCallback(() => setCompareList([]), []);

  const canAddMore = useMemo(() => compareList.length < MAX_COMPARE, [compareList]);

  const value = {
    compareList,
    isComparing,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    canAddMore,
    maxCompare: MAX_COMPARE,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within a CompareProvider");
  return ctx;
};