// src/pages/AdminDashboard.jsx

import React, { useState } from "react";
import StatsTab from "../components/admin/StatsTab";
import UsersTab from "../components/admin/UsersTab";
import ProductsTab from "../components/admin/ProductsTab";
import OrdersTab from "../components/admin/OrdersTab";   // ✅ You already imported it — perfect

export default function AdminDashboard() {
  const [tab, setTab] = useState("stats");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      
      {/* ✅ Added orders to the tab list */}
      <div className="flex space-x-4 mb-6">
        {["stats", "users", "products", "orders"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ✅ Added OrdersTab conditionally */}
      {tab === "stats" && <StatsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "orders" && <OrdersTab />}
    </div>
  );
}
