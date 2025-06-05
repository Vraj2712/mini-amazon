// src/pages/Orders.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError("");
      try {
        // 1) fetch raw orders
        const resp = await axiosInstance.get("/orders");
        const rawOrders = resp.data; // array of {id, items[], status, created_at}

        // 2) for each order, fetch product details in parallel
        const detailed = await Promise.all(
          rawOrders.map(async (order) => {
            const itemsWithDetails = await Promise.all(
              order.items.map(async (item) => {
                try {
                  const pResp = await axiosInstance.get(
                    `/products/${item.product_id}`
                  );
                  return {
                    name: pResp.data.name,
                    price: pResp.data.price,
                    quantity: item.quantity,
                  };
                } catch {
                  return { name: "Unknown", price: 0, quantity: item.quantity };
                }
              })
            );

            const total = itemsWithDetails.reduce(
              (sum, it) => sum + it.price * it.quantity,
              0
            );

            return {
              id: order.id,
              created_at: new Date(order.created_at).toLocaleString(),
              status: order.status,
              items: itemsWithDetails,
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
    }

    loadOrders();
  }, []);

  if (loading) {
    return <div className="p-6">Loading your orders…</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }
  if (orders.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">My Orders</h2>
        <p>You haven’t placed any orders yet.</p>
      </div>
    );
  }

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
            <p className="mt-1">Status: <strong>{order.status}</strong></p>
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
