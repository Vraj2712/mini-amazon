// src/pages/Home.jsx (snippet)
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const resp = await axiosInstance.get("/products");
        setProducts(resp.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading) return <div className="p-4">Loading products…</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {products.map((p) => (
        <div key={p.id} className="border p-4 rounded space-y-2">
          <h3 className="text-xl font-semibold">{p.name}</h3>
          <p className="text-gray-600">${p.price.toFixed(2)}</p>
          <Link
            to={`/products/${p.id}`}
            className="text-blue-600 hover:underline"
          >
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
}
