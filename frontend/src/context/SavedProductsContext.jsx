import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { request } from "../api";

const SavedProductsContext = createContext(null);

const getStorageKey = (userId) => `savedProducts_${userId}`;

const sanitizeSavedIds = (ids) =>
  Array.from(new Set((Array.isArray(ids) ? ids : []).filter(Boolean)));

const readSavedIds = (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    return stored ? sanitizeSavedIds(JSON.parse(stored)) : [];
  } catch {
    return [];
  }
};

export const SavedProductsProvider = ({ children }) => {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(() =>
    user?._id ? readSavedIds(user._id) : [],
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateSavedIds = async () => {
      if (!user?._id) {
        if (isMounted) {
          setSavedIds([]);
          setIsHydrated(true);
        }
        return;
      }

      const localIds = readSavedIds(user._id);

      try {
        const products = await request("/api/products");
        const validProductIds = new Set((products || []).map((item) => item?._id));
        const cleanedIds = localIds.filter((id) => validProductIds.has(id));

        if (isMounted) {
          setSavedIds(cleanedIds);
          setIsHydrated(true);
        }
      } catch {
        if (isMounted) {
          // Fall back to local ids if product sync fails.
          setSavedIds(localIds);
          setIsHydrated(true);
        }
      }
    };

    hydrateSavedIds();

    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  useEffect(() => {
    if (!isHydrated || !user?._id) return;
    localStorage.setItem(getStorageKey(user._id), JSON.stringify(savedIds));
  }, [savedIds, user?._id, isHydrated]);

  const toggleSaved = (productId) => {
    if (!user?._id) {
      throw new Error("Please log in first.");
    }

    setSavedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : sanitizeSavedIds([...current, productId]),
    );
  };

  const isSaved = (productId) => savedIds.includes(productId);

  return (
    <SavedProductsContext.Provider
      value={{
        savedIds,
        savedCount: savedIds.length,
        isSaved,
        toggleSaved,
      }}
    >
      {children}
    </SavedProductsContext.Provider>
  );
};

export const useSavedProducts = () => useContext(SavedProductsContext);
