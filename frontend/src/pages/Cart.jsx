// src/pages/Cart.jsx
import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const total = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      // 1. Create backend cart entries
      //    In our FastAPI, placing an order pulls from *server‐side* cart tied to user.  
      //    For simplicity, we can just call PUT /cart/update for each item, then POST /orders.
      //    But earlier backend logic expects items in the “user’s cart” collection in Mongo,
      //    so you’d need to sync localStorage cart to server first:
      for (const item of items) {
        await axiosInstance.post('/cart/add', {
          product_id: item.product.id,
          quantity: item.quantity,
        });
      }
      // 2. Place the order
      const resp = await axiosInstance.post('/orders/');
      alert('Order placed: ' + JSON.stringify(resp.data));
      clearCart();
      navigate('/orders');
    } catch (err) {
      console.error(err);
      alert('Checkout failed: ' + err.response?.data?.detail || err.message);
    }
  };

  if (items.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Product</th>
            <th className="text-left py-2">Qty</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Subtotal</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.product.id} className="border-b">
              <td className="py-2">{item.product.name}</td>
              <td className="py-2">
                <input
                  type="number"
                  min={1}
                  className="border px-2 py-1 w-16"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.product.id, parseInt(e.target.value, 10) || 1)
                  }
                />
              </td>
              <td className="text-right py-2">${item.product.price.toFixed(2)}</td>
              <td className="text-right py-2">
                ${(item.product.price * item.quantity).toFixed(2)}
              </td>
              <td className="py-2 text-right">
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-red-500 underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-4">
        <p className="text-xl font-semibold">Total: ${total.toFixed(2)}</p>
        <button
          onClick={handleCheckout}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
