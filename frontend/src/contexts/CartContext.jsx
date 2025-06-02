// src/contexts/CartContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const CartContext = createContext({
  cartItems: [],         // current array of items
  fetchCart: async () => {}, 
  addItem: async (id, qty) => {},
  removeItem: async (id) => {},
  clearCart: () => {},
});

export function CartProvider({ children }) {
  const { user } = useAuth();               // watch for user login/logout
  const [cartItems, setCartItems] = useState([]);

  // 1. Fetch cart whenever `user` changes (login or logout)
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]); // clear cart when no user
    }
  }, [user]);

  // 2. fetchCart(): GET /cart
  async function fetchCart() {
    try {
      const resp = await axiosInstance.get("/cart");
      // Assuming backend returns { items: [ { product_id, quantity, product: {...} }, ... ] }
      setCartItems(resp.data.items || []);
    } catch (err) {
      console.error("Could not fetch cart:", err);
    }
  }

  // 3. addItem(productId, quantity): POST /cart/add
  async function addItem(productId, quantity) {
    try {
      await axiosInstance.post("/cart/add", { product_id: productId, quantity });
      // Re‐fetch so React‐state stays in sync with the backend
      await fetchCart();
    } catch (err) {
      console.error("Could not add item to cart:", err);
      throw err;
    }
  }

  // 4. removeItem(productId): just call addItem with qty=0 (or do a DELETE)
  async function removeItem(productId) {
    try {
      await axiosInstance.post("/cart/add", { product_id: productId, quantity: 0 });
      await fetchCart();
    } catch (err) {
      console.error("Could not remove item from cart:", err);
      throw err;
    }
  }

  // 5. clearCart(): convenience if you want to wipe the cart
  function clearCart() {
    setCartItems([]);
  }

  return (
    <CartContext.Provider
      value={{ cartItems, fetchCart, addItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook
export function useCart() {
  return useContext(CartContext);
}
