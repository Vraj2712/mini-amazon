// src/components/admin/OrdersTab.jsx

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`/admin/orders?page=${page}&limit=10&status=${filterStatus}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order", err);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-300";
      case "shipped": return "bg-blue-300";
      case "delivered": return "bg-green-300";
      case "cancelled": return "bg-red-300";
      default: return "bg-gray-200";
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">All Orders</h2>

      {/* Filter & Pagination Controls */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-2 border rounded"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 border rounded"
          >
            Next
          </button>
          <span>Page: {page}</span>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="p-4 border rounded shadow">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold">Order ID: {order.id}</h4>
                  <div className={`px-3 py-1 rounded ${statusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>

                <p>User: {order.user_email}</p>
                <p>Total: ${order.total_price.toFixed(2)}</p>
                <p>Created: {new Date(order.created_at).toLocaleString()}</p>

                <h5 className="font-semibold mt-3">Items:</h5>
                <ul className="list-disc list-inside">
                  {order.items.map(item => (
                    <li key={item.product_id}>
                      Product ID: {item.product_id} | Qty: {item.quantity} | Price: ${item.price_at_purchase}
                    </li>
                  ))}
                </ul>

                <div className="flex space-x-2 mt-4">
                  <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="bg-blue-500 text-white px-3 py-1 rounded">Ship</button>
                  <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-green-500 text-white px-3 py-1 rounded">Deliver</button>
                  <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="bg-red-500 text-white px-3 py-1 rounded">Cancel</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
