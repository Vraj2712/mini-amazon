// src/pages/Orders.jsx
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useWs } from "../contexts/WsContext";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper to reload all orders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await axiosInstance.get("/orders");
      const raw = resp.data;
      const detailed = await Promise.all(
        raw.map(async (order) => {
          const items = await Promise.all(
            order.items.map(async (it) => {
              try {
                const p = await axiosInstance.get(`/products/${it.product_id}`);
                return {
                  name: p.data.name,
                  price: p.data.price,
                  quantity: it.quantity,
                };
              } catch {
                return { name: "Unknown", price: 0, quantity: it.quantity };
              }
            })
          );
          const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return {
            id: order.id,
            created_at: new Date(order.created_at).toLocaleString(),
            status: order.status,
            items,
            total: total.toFixed(2),
          };
        })
      );
      setOrders(detailed);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // When an order_update arrives, update that order in our local state
  useWs((msg) => {
    if (msg.type === "order_update") {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === msg.order_id ? { ...o, status: msg.new_status } : o
        )
      );
    }
  });

  if (loading) return <div className="p-6">Loading your orders…</div>;
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!orders.length)
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">My Orders</h2>
        <p>You haven’t placed any orders yet.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">My Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border p-4 rounded shadow-sm bg-white"
          >
            <div className="flex justify-between">
              <span className="font-medium">Order ID: {order.id}</span>
              <span className="text-sm text-gray-600">
                {order.created_at}
              </span>
            </div>
            <p className="mt-1">
              Status: <strong>{order.status}</strong>
            </p>
            <ul className="mt-2 space-y-1">
              {order.items.map((it, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>
                    {it.name} × {it.quantity}
                  </span>
                  <span>${(it.price * it.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 text-right font-semibold">
              Total: ${order.total}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
