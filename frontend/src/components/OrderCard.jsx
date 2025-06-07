// src/components/OrderCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function OrderCard({ order }) {
  // order = { id, items: [ { name, quantity, price_at_purchase } ], total, status, created_at }
  const createdDate = new Date(order.created_at).toLocaleString();

  // Show just summary: order date, total, status, and a “View Details” link
  return (
    <div className="border rounded p-4 mb-4 bg-white shadow">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">Order Date:</p>
          <p className="text-gray-600">{createdDate}</p>
        </div>
        <div>
          <p className="font-semibold">Status:</p>
          <p className="text-gray-600 capitalize">{order.status}</p>
        </div>
        <div>
          <p className="font-semibold">Total:</p>
          <p className="text-gray-600">${order.total.toFixed(2)}</p>
        </div>
      </div>
      <Link
        to={`/orders/${order.id}`}
        className="mt-3 inline-block text-blue-600 hover:underline"
      >
        View Details
      </Link>
    </div>
  );
}
