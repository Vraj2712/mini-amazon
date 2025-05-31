// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      try {
        const resp = await axiosInstance.get('/orders/');
        setOrders(resp.data);
      } catch (err) {
        setError('Failed to fetch orders');
      }
    }
    fetchOrders();
  }, []);

  if (orders.length === 0) {
    return <p>You have no orders yet.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-4">
        {orders.map((order) => (
          <li
            key={order.id}
            className="border rounded shadow p-4 flex justify-between"
          >
            <div>
              <p>
                <strong>Order ID:</strong> {order.id}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(order.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <div className="mt-2">
                <strong>Items:</strong>
                <ul className="list-disc ml-6">
                  {order.items.map((item) => (
                    <li key={item.product_id}>
                      Product ID: {item.product_id} &times; {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">
                Total: ${order.total_price.toFixed(2)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
