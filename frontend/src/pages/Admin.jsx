// src/pages/Admin.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load admin stats"));
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!stats) return <div className="p-6">Loading dashboard…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-medium">Total Users</h3>
          <p className="text-3xl">{stats.total_users}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-medium">Total Products</h3>
          <p className="text-3xl">{stats.total_products}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-medium">Total Orders</h3>
          <p className="text-3xl">{stats.total_orders}</p>
        </div>
        <div className="col-span-full p-4 bg-white rounded shadow">
          <h3 className="font-medium mb-2">Orders by Status</h3>
          <ul>
            {Object.entries(stats.orders_by_status).map(([status, count]) => (
              <li
                key={status}
                className="flex justify-between py-1 border-b last:border-none"
              >
                <span className="capitalize">{status}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
