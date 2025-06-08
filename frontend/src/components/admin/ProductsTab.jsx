// src/components/admin/ProductsTab.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: 0,
    in_stock: true,
    category: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Load products & categories
  const loadProducts = () =>
    axiosInstance.get("/admin/products").then((res) => setProducts(res.data));
  const loadCategories = () =>
    axiosInstance
      .get("/products/categories")
      .then((res) => setCategories(res.data));

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Create new product
  const handleCreate = async (e) => {
    e.preventDefault();
    await axiosInstance.post("/admin/products", form);
    setForm({ name: "", price: 0, in_stock: true, category: "" });
    loadProducts();
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Really delete this product?")) return;
    await axiosInstance.delete(`/admin/products/${id}`);
    loadProducts();
  };

  // Begin editing
  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      price: p.price,
      in_stock: p.in_stock,
      category: p.category || "",
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Save edited
  const saveEdit = async (id) => {
    await axiosInstance.put(`/admin/products/${id}`, editForm);
    setEditingId(null);
    setEditForm({});
    loadProducts();
  };

  // filter products by searchTerm
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Create Form */}
      <form onSubmit={handleCreate} className="mb-6 grid gap-4 grid-cols-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="border px-2 py-1"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm((f) => ({ ...f, price: Number(e.target.value) }))
          }
          className="border px-2 py-1"
          min="0"
          required
        />
        <select
          value={form.category}
          onChange={(e) =>
            setForm((f) => ({ ...f, category: e.target.value }))
          }
          className="border px-2 py-1"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.in_stock}
            onChange={(e) =>
              setForm((f) => ({ ...f, in_stock: e.target.checked }))
            }
          />
          <span>In Stock</span>
        </label>
        <button
          type="submit"
          className="col-span-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create Product
        </button>
      </form>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 w-full"
        />
      </div>

      {/* Products Table */}
      <table className="w-full table-auto bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Price</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-left">In Stock</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} className="even:bg-gray-50">
              {editingId === p.id ? (
                <>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="border px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          price: Number(e.target.value),
                        }))
                      }
                      className="border px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          category: e.target.value,
                        }))
                      }
                      className="border px-2 py-1 w-full"
                    >
                      <option value="">--</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={editForm.in_stock}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          in_stock: e.target.checked,
                        }))
                      }
                    />
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => saveEdit(p.id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-2">{p.category || "-"}</td>
                  <td className="px-4 py-2">{p.in_stock ? "Yes" : "No"}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
