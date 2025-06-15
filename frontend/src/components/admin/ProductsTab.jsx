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
    image: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = () => axiosInstance.get("/admin/products").then(res => setProducts(res.data));
  const loadCategories = () => axiosInstance.get("/products/categories").then(res => setCategories(res.data));

  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axiosInstance.post("/products/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (isEdit) {
        setEditForm(f => ({ ...f, image: res.data.url }));
      } else {
        setForm(f => ({ ...f, image: res.data.url }));
      }
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await axiosInstance.post("/admin/products", form);
    setForm({ name: "", price: 0, in_stock: true, category: "", image: "" });
    loadProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    await axiosInstance.delete(`/admin/products/${id}`);
    loadProducts();
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price,
      in_stock: product.in_stock,
      category: product.category || "",
      image: product.image || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    await axiosInstance.put(`/admin/products/${id}`, editForm);
    setEditingId(null);
    setEditForm({});
    loadProducts();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create Product</h2>
      <form onSubmit={handleCreate} className="mb-6 grid gap-4 grid-cols-4">
        <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="border px-2 py-1" required />
        <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="border px-2 py-1" min="0" required />
        <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="border px-2 py-1">
          <option value="">Select category</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm(f => ({ ...f, in_stock: e.target.checked }))} />
          <span>In Stock</span>
        </label>
        <input type="file" onChange={(e) => handleImageUpload(e)} />
        {form.image && <img src={`http://localhost:8000${form.image}`} alt="Preview" className="h-24" />}
        <button type="submit" className="col-span-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create Product</button>
      </form>

      <h2 className="text-xl font-semibold mb-4">All Products</h2>
      <div className="grid grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="border rounded p-4 shadow">
            {editingId === p.id ? (
              <>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className="border px-2 py-1 mb-2 w-full" />
                <input type="number" value={editForm.price} onChange={(e) => setEditForm(f => ({ ...f, price: Number(e.target.value) }))} className="border px-2 py-1 mb-2 w-full" />
                <select value={editForm.category} onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))} className="border px-2 py-1 mb-2 w-full">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <label className="flex items-center space-x-2 mb-2">
                  <input type="checkbox" checked={editForm.in_stock} onChange={(e) => setEditForm(f => ({ ...f, in_stock: e.target.checked }))} />
                  <span>In Stock</span>
                </label>
                <input type="file" onChange={(e) => handleImageUpload(e, true)} className="mb-2" />
                {editForm.image && <img src={`http://localhost:8000${editForm.image}`} className="h-24 mb-2" />}
                <div className="flex space-x-2">
                  <button onClick={() => saveEdit(p.id)} className="bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                  <button onClick={cancelEdit} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
                </div>
              </>
            ) : (
              <>
                {p.image && <img src={`http://localhost:8000${p.image}`} className="h-32 w-full object-cover mb-2" />}
                <h3 className="font-bold">{p.name}</h3>
                <p>${p.price.toFixed(2)}</p>
                <p>In Stock: {p.in_stock ? "Yes" : "No"}</p>
                <div className="flex space-x-2 mt-2">
                  <button onClick={() => startEdit(p)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
