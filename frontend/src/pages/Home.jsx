// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import ProductCard from "../components/ProductCard";

export default function Home() {
  //
  // ── STATE ──────────────────────────────────────────────────────────────────────
  //
  // products[] will hold whatever array the backend returns.
  const [products, setProducts] = useState([]);

  // We’ll show a “Loading…” spinner while the fetch is in progress,
  // or an error if something goes wrong.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FILTER FIELDS
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);

  //
  // ── FETCHING LOGIC ───────────────────────────────────────────────────────────────
  //
  // This helper will always call `/products/search` (even if `params` is empty).
  // Your FastAPI endpoint should be set up so that `/products/search` with no params
  // simply returns all products.
  async function fetchProducts(params = {}) {
    setLoading(true);
    setError("");

    try {
      // If `params` is empty, this becomes a request to:
      //   GET http://localhost:8000/products/search
      //
      // Otherwise, it becomes something like:
      //   GET http://localhost:8000/products/search?q=iphone&min_price=10
      const response = await axiosInstance.get("/products/search", { params });

      // Log the raw response to the console for debugging:
      console.log("💡 [Home.jsx] fetched products:", response.data);

      // response.data should be an array of { id, name, price, description, created_at, … }
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please try again.");
      setProducts([]); // clear out any previous data
    } finally {
      setLoading(false);
    }
  }

  //
  // ── ON MOUNT: LOAD ALL PRODUCTS ──────────────────────────────────────────────────
  //
  useEffect(() => {
    // On first render, fetch with an empty params object → returns *all* products.
    fetchProducts();
  }, []);

  //
  // ── WHEN “Filter” BUTTON IS CLICKED ──────────────────────────────────────────────
  //
  const handleFilter = () => {
    const params = {};

    if (q.trim() !== "") {
      params.q = q.trim();
    }
    if (minPrice !== "") {
      // Convert to a number so that FastAPI sees it as a float
      params.min_price = Number(minPrice);
    }
    if (maxPrice !== "") {
      params.max_price = Number(maxPrice);
    }
    if (inStock) {
      // Only include this param if the checkbox is checked
      params.in_stock = true;
    }

    fetchProducts(params);
  };

  //
  // ── RENDER ───────────────────────────────────────────────────────────────────────
  //
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* ─────────────── Search & Filter Form ─────────────── */}
      <div className="border rounded p-4 bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Search &amp; Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search by Name */}
          <div>
            <label className="block mb-1 font-medium">Search</label>
            <input
              type="text"
              placeholder="Product name…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          {/* Min Price */}
          <div>
            <label className="block mb-1 font-medium">Min Price</label>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block mb-1 font-medium">Max Price</label>
            <input
              type="number"
              min="0"
              placeholder="9999.99"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          {/* In Stock Checkbox */}
          <div className="flex items-center">
            <input
              id="inStockCheckbox"
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="inStockCheckbox" className="font-medium">
              In Stock
            </label>
          </div>
        </div>

        <button
          onClick={handleFilter}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Filter
        </button>
      </div>

      {/* ─────────────── Show Loading / Error / No Results ─────────────── */}
      {loading ? (
        <p className="text-center text-gray-500">Loading products…</p>
      ) : error ? (
        <p className="text-center text-red-500">Error: {error}</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-600">No results found.</p>
      ) : (
        /* ─────────────── Product Grid ─────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
