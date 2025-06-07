// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      setError("");
      try {
        const resp = await axiosInstance.get(`/orders/${orderId}`);
        setOrder(resp.data);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.detail ||
            "Failed to load order details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="p-6">Loading order details…</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }
  if (!order) {
    return <div className="p-6">No such order found.</div>;
  }

  // Format date
  const createdDate = new Date(order.created_at).toLocaleString();
  const updatedDate = new Date(order.updated_at).toLocaleString();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>

      <p>
        <span className="font-semibold">Order ID:</span> {order.id}
      </p>
      <p>
        <span className="font-semibold">Placed On:</span> {createdDate}
      </p>
      <p>
        <span className="font-semibold">Last Updated:</span> {updatedDate}
      </p>
      <p>
        <span className="font-semibold">Status:</span>{" "}
        <span className="capitalize">{order.status}</span>
      </p>

      <hr />

      <h3 className="text-xl font-semibold mt-4">Items</h3>
      <table className="w-full border-collapse mt-2">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Product</th>
            <th className="text-left py-2">Unit Price</th>
            <th className="text-left py-2">Quantity</th>
            <th className="text-left py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => {
            // Each item shape: { name, quantity, price_at_purchase, product_id }
            const subtotal = item.price_at_purchase * item.quantity;
            return (
              <tr key={item.product_id} className="border-b">
                <td className="py-2">{item.name || "Unknown Product"}</td>
                <td className="py-2">${item.price_at_purchase.toFixed(2)}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">${subtotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="text-right text-xl font-semibold mt-4">
        Total: ${order.total.toFixed(2)}
      </div>

      <Link
        to="/orders"
        className="inline-block mt-6 text-blue-600 hover:underline"
      >
        ← Back to My Orders
      </Link>
    </div>
  );
}
