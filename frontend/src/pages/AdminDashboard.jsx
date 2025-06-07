// src/pages/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/admin/summary")
      .then((res) => setSummary(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Failed to load"));
  }, []);

  if (!user?.is_admin) return <p className="p-6">403: Forbidden</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;
  if (!summary) return <p className="p-6">Loading dashboard…</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white shadow">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">Users</h3>
          <p className="text-3xl">{summary.total_users}</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">Products</h3>
          <p className="text-3xl">{summary.total_products}</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">Orders</h3>
          <p className="text-3xl">{summary.total_orders}</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Orders by Status</h2>
        <ul className="mt-2 space-y-1">
          {Object.entries(summary.orders_by_status).map(([status, count]) => (
            <li key={status} className="flex justify-between">
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              <span>{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
