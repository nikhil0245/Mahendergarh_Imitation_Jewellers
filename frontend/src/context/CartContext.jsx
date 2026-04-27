import { createContext, useContext, useEffect, useState } from "react";
import { request } from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const normalizeCart = (data) => ({
    items: Array.isArray(data?.items) ? data.items.filter(Boolean) : [],
  });

  // ================= FETCH CART =================
  const fetchCart = async () => {
    try {
      if (!user) {
        setCart({ items: [] });
        return;
      }

      const data = await request("/api/cart");
      setCart(normalizeCart(data));
    } catch (err) {
      console.error("Fetch Cart Error:", err);
      setCart({ items: [] });
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // ================= ADD TO CART =================
  const addToCart = async (productId, quantity) => {
    if (!user) {
      throw new Error("Please log in first.");
    }

    try {
      const data = await request("/api/cart", {
        method: "POST",
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      // 🔥 IMPORTANT: cart refresh
      await fetchCart();

      return data;
    } catch (err) {
      console.error("Add To Cart Error:", err);
      throw err;
    }
  };

  // ================= UPDATE =================
  const updateQuantity = async (productId, quantity) => {
    if (!user) {
      throw new Error("Please log in first.");
    }

    try {
      const data = await request(`/api/cart/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });

      setCart(normalizeCart(data));
      return data;
    } catch (err) {
      console.error("Update Cart Error:", err);
      throw err;
    }
  };

  // ================= DELETE =================
  const removeFromCart = async (productId) => {
    if (!user) {
      throw new Error("Please log in first.");
    }

    try {
      const data = await request(`/api/cart/${productId}`, {
        method: "DELETE",
      });

      setCart(normalizeCart(data));
    } catch (err) {
      console.error("Remove Cart Error:", err);
    }
  };

  // ================= TOTAL =================
  const itemCount = (cart?.items || []).reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const subtotal = (cart?.items || []).reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
