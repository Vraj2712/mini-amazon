// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axiosInstance.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load admin stats.");
      }
    }
    fetchStats();
  }, []);

  if (!user?.is_admin) {
    return <div className="p-6">403 Forbidden—admins only.</div>;
  }
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!stats) return <div className="p-6">Loading stats…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border p-4 rounded">
          <h3 className="font-medium">Products</h3>
          <p className="text-3xl">{stats.total_products}</p>
        </div>
        <div className="border p-4 rounded">
          <h3 className="font-medium">Users</h3>
          <p className="text-3xl">{stats.total_users}</p>
        </div>
        <div className="border p-4 rounded">
          <h3 className="font-medium">Orders</h3>
          <p className="text-3xl">{stats.total_orders}</p>
        </div>
        <div className="border p-4 rounded col-span-full">
          <h3 className="font-medium">Orders by Status</h3>
          <ul className="mt-2 space-y-1">
            {Object.entries(stats.orders_by_status).map(([status, count]) => (
              <li key={status} className="flex justify-between">
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
