// src/components/admin/StatsTab.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const STATUSES = ["pending", "shipped", "delivered", "cancelled"];

export default function StatsTab() {
  const [stats, setStats] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");

  // 1) Load summary stats on mount
  useEffect(() => {
    axiosInstance
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch((_) => {}) // ignore
  }, []);

  // 2) When you click a status, fetch all orders of that status
  const loadOrdersByStatus = (status) => {
    setSelectedStatus(status);
    setOrders([]);
    setError("");
    setLoadingOrders(true);

    axiosInstance
      .get("/admin/orders", { params: { status } })
      .then((res) => setOrders(res.data))
      .catch((err) => setError("Failed to load orders"))
      .finally(() => setLoadingOrders(false));
  };

  // 3) Flip one order’s status
  const changeOrderStatus = (orderId, newStatus) => {
    axiosInstance
      .put(`/orders/${orderId}/status`, { status: newStatus })
      .then(() => loadOrdersByStatus(selectedStatus))
      .catch((err) => alert(err.response?.data?.detail || "Update failed"));
  };

  if (!stats) return <p>Loading stats…</p>;

  return (
    <div className="space-y-8">
      {/* ── Summary Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card title="Users" value={stats.total_users} />
        <Card title="Products" value={stats.total_products} />
        <Card title="Orders" value={stats.total_orders} />
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-medium mb-2">Orders by Status</h3>
          <ul className="space-y-1">
            {STATUSES.map((st) => (
              <li key={st} className="flex justify-between">
                <button
                  className={`underline ${
                    selectedStatus === st ? "font-bold" : ""
                  }`}
                  onClick={() => loadOrdersByStatus(st)}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
                <span>{stats.orders_by_status[st] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Orders List & Status Controls ──────────────────────────── */}
      {selectedStatus && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Orders: {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
          </h2>

          {loadingOrders ? (
            <p>Loading orders…</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : orders.length === 0 ? (
            <p>No orders in this status.</p>
          ) : (
            <table className="w-full table-auto bg-white rounded shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Order ID</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="even:bg-gray-50">
                    <td className="px-4 py-2">{o.id}</td>
                    <td className="px-4 py-2">${o.total_price.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <select
                        value={o.status}
                        onChange={(e) => changeOrderStatus(o.id, e.target.value)}
                        className="border px-2 py-1"
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.charAt(0).toUpperCase() + st.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-medium">{title}</h3>
      <p className="text-2xl">{value}</p>
    </div>
  );
}
