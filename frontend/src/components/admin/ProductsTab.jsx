// src/components/admin/ProductsTab.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: 0, in_stock: true });

  const loadProducts = () =>
    axiosInstance.get("/admin/products").then((res) => setProducts(res.data));

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await axiosInstance.post("/admin/products", form);
    setForm({ name: "", price: 0, in_stock: true });
    loadProducts();
  };

  const handleDelete = async (id) => {
    await axiosInstance.delete(`/admin/products/${id}`);
    loadProducts();
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="mb-6 grid gap-4 grid-cols-3">
        {/* …inputs… */}
      </form>

      <table className="w-full table-auto bg-white rounded shadow">
        {/* …table head… */}
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="even:bg-gray-50">
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2">${p.price.toFixed(2)}</td>
              <td className="px-4 py-2">{p.in_stock ? "Yes" : "No"}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
