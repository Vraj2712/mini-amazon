// src/contexts/CartContext.jsx
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext({
  items: [],
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  updateQuantity: (productId, qty) => {},
  clearCart: () => {},
});

export function CartProvider({ children }) {
  const [items, setItems] = useState(
    JSON.parse(localStorage.getItem('cart_items')) || []
  );

  // Persist cart to localStorage
  const persist = (newItems) => {
    localStorage.setItem('cart_items', JSON.stringify(newItems));
    setItems(newItems);
  };

  const addToCart = (product, quantity = 1) => {
    const existing = items.find((i) => i.product.id === product.id);
    let updated;
    if (existing) {
      updated = items.map((i) =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      updated = [...items, { product, quantity }];
    }
    persist(updated);
  };

  const removeFromCart = (productId) => {
    const updated = items.filter((i) => i.product.id !== productId);
    persist(updated);
  };

  const updateQuantity = (productId, quantity) => {
    const updated = items.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    persist(updated);
  };

  const clearCart = () => {
    persist([]);
  };

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
