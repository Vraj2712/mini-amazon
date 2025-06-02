// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Cart() {
  const [detailedItems, setDetailedItems] = useState([]); // { product_id, quantity, product }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // 1) Load cart on mount or whenever token changes
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadCart = async () => {
      setLoading(true);
      setError("");
      try {
        // GET /cart → { items: [ { product_id, quantity } , … ] }
        const cartResp = await axiosInstance.get("/cart");
        const items = cartResp.data.items || [];

        // Fetch product details in parallel
        const details = await Promise.all(
          items.map(async (item) => {
            try {
              const prodResp = await axiosInstance.get(
                `/products/${item.product_id}`
              );
              return {
                product_id: item.product_id,
                quantity: item.quantity,
                product: prodResp.data,
              };
            } catch {
              return {
                product_id: item.product_id,
                quantity: item.quantity,
                product: null,
              };
            }
          })
        );
        setDetailedItems(details);
      } catch (err) {
        console.error("Failed to load cart:", err);
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          logout();
        } else {
          setError(
            err.response?.data?.detail || "Could not load your cart."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [token, logout, navigate]);

  // 2) Remove a single item
  const handleRemove = async (product_id) => {
    // Optimistically remove from UI
    setDetailedItems((prev) =>
      prev.filter((it) => it.product_id !== product_id)
    );

    try {
      // **Make sure this matches your FastAPI route exactly**:
      // DELETE http://localhost:8000/cart/{product_id}
      await axiosInstance.delete(`/cart/${product_id}`);
    } catch (err) {
      console.error("Delete error:", err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        // Unauthorized → force logout
        logout();
        return;
      }
      if (status === 404) {
        setError("Item was not found in your cart.");
      } else {
        setError(err.response?.data?.detail || "Could not remove item.");
      }
      // Re‐load the cart so UI stays consistent
      try {
        const reloadResp = await axiosInstance.get("/cart");
        const items = reloadResp.data.items || [];
        const details = await Promise.all(
          items.map(async (item) => {
            try {
              const prodResp = await axiosInstance.get(
                `/products/${item.product_id}`
              );
              return {
                product_id: item.product_id,
                quantity: item.quantity,
                product: prodResp.data,
              };
            } catch {
              return {
                product_id: item.product_id,
                quantity: item.quantity,
                product: null,
              };
            }
          })
        );
        setDetailedItems(details);
      } catch (reloadErr) {
        console.error("Failed to reload cart:", reloadErr);
      }
    }
  };

  // 3) Change quantity
  const handleQuantityChange = async (product_id, newQty) => {
    // Update local state first
    setDetailedItems((prev) =>
      prev.map((it) =>
        it.product_id === product_id ? { ...it, quantity: newQty } : it
      )
    );

    try {
      await axiosInstance.put("/cart/update", {
        product_id,
        quantity: newQty,
      });
      if (newQty === 0) {
        // Remove locally if quantity becomes zero
        setDetailedItems((prev) =>
          prev.filter((it) => it.product_id !== product_id)
        );
      }
    } catch (err) {
      console.error("Quantity update error:", err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        logout();
        return;
      }
      setError(err.response?.data?.detail || "Could not update quantity.");
      // Re‐fetch cart on failure
      try {
        const reloadResp = await axiosInstance.get("/cart");
        const items = reloadResp.data.items || [];
        const details = await Promise.all(
          items.map(async (item) => {
            try {
              const prodResp = await axiosInstance.get(
                `/products/${item.product_id}`
              );
              return {
                product_id: item.product_id,
                quantity: item.quantity,
                product: prodResp.data,
              };
            } catch {
              return {
                product_id: item.product_id,
                quantity: item.quantity,
                product: null,
              };
            }
          })
        );
        setDetailedItems(details);
      } catch (reloadErr) {
        console.error("Failed to reload cart:", reloadErr);
      }
    }
  };

  // 4) Place order
  const handlePlaceOrder = async () => {
    if (detailedItems.length === 0) return;
    try {
      await axiosInstance.post("/orders/");
      navigate("/orders");
    } catch (err) {
      console.error("Place order error:", err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        logout();
      } else {
        setError(err.response?.data?.detail || "Could not place order.");
      }
    }
  };

  // 5) Render states
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading your cart…
      </div>
    );
  }

  if (error && detailedItems.length === 0) {
    return (
      <div className="p-6 text-center text-red-600">{error}</div>
    );
  }

  if (detailedItems.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  const totalPrice = detailedItems.reduce((sum, it) => {
    if (!it.product) return sum;
    return sum + it.product.price * it.quantity;
  }, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Your Cart</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Product</th>
            <th className="text-left py-2">Unit Price</th>
            <th className="text-left py-2">Quantity</th>
            <th className="text-left py-2">Subtotal</th>
            <th className="text-left py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {detailedItems.map((item) => {
            const { product_id, quantity, product } = item;
            const name = product ? product.name : "Unknown";
            const price = product ? product.price : 0;
            const subtotal = price * quantity;

            return (
              <tr key={product_id} className="border-b">
                <td className="py-3">{name}</td>
                <td className="py-3">${price.toFixed(2)}</td>
                <td className="py-3">
                  <select
                    className="border px-2 py-1"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        product_id,
                        Number(e.target.value)
                      )
                    }
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3">${subtotal.toFixed(2)}</td>
                <td className="py-3">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleRemove(product_id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="text-right text-xl font-semibold">
        Total: ${totalPrice.toFixed(2)}
      </div>

      <button
        onClick={handlePlaceOrder}
        className="mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
      >
        Place Order
      </button>
    </div>
  );
}
