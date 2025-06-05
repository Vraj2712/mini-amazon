// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import ProductCard from "../components/ProductCard";

export default function Home() {
  //
  // ── STATE ──────────────────────────────────────────────────────────────────────
  //
  const [products, setProducts] = useState([]);          // array of products from backend
  const [categories, setCategories] = useState([]);      // array of "Electronics", "Books", ...
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FILTER / PAGINATION FIELDS
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [page, setPage] = useState(1);                    // current page number
  const limit = 12;                                       // items per page

  //
  // ── FETCH CATEGORIES ON MOUNT ──────────────────────────────────────────────────
  //
  useEffect(() => {
    axiosInstance
      .get("/products/categories")
      .then((res) => {
        setCategories(res.data); // e.g. ["Electronics","Books",...]
      })
      .catch((_) => {
        // ignore errors here—categories are optional
      });
  }, []);

  //
  // ── FETCHING PRODUCTS (with filters + pagination) ──────────────────────────────
  //
  async function fetchProducts(params = {}) {
    setLoading(true);
    setError("");

    // Always include page & limit
    params.page = page;
    params.limit = limit;

    try {
      const response = await axiosInstance.get("/products/search", { params });
      console.log("💡 [Home.jsx] fetched products:", response.data);
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  //
  // ── ON MOUNT & WHEN page CHANGES: LOAD PRODUCTS ─────────────────────────────────
  //
  useEffect(() => {
    // any time `page` changes, re-fetch with current filters
    handleFilter(); 
    // eslint-disable react-hooks/exhaustive-deps
  }, [page]);

  //
  // ── WHEN “Filter” BUTTON IS CLICKED ─────────────────────────────────────────────
  //
  const handleFilter = () => {
    const params = {};

    if (q.trim() !== "") {
      params.q = q.trim();
    }
    if (minPrice !== "") {
      params.min_price = Number(minPrice);
    }
    if (maxPrice !== "") {
      params.max_price = Number(maxPrice);
    }
    if (inStock) {
      params.in_stock = true;
    }
    if (selectedCategory) {
      params.category = selectedCategory;
    }
    // always include page & limit
    params.page = page;
    params.limit = limit;

    fetchProducts(params);
  };

  //
  // ── RENDER ───────────────────────────────────────────────────────────────────────
  //
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* ─── Search & Filter Form ─────────────────────────────────────── */}
      <div className="border rounded p-4 bg-gray-50 space-y-4">
        <h2 className="text-xl font-semibold">Search & Filter</h2>
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

          {/* Category Select */}
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Empty placeholder to keep grid layout */}
          <div></div>
        </div>

        <button
          onClick={() => {
            setPage(1); // reset to first page whenever filter changes
            handleFilter();
          }}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Filter
        </button>
      </div>

      {/* ─── Loading / Error / No Results ─────────────────────────────────────────── */}
      {loading ? (
        <p className="text-center text-gray-500">Loading products…</p>
      ) : error ? (
        <p className="text-center text-red-500">Error: {error}</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-600">No results found.</p>
      ) : (
        <>
          {/* ─── Product Grid ────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

          {/* ─── Pagination Controls ─────────────────────────────────────────────── */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded ${
                page === 1
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>
            <span className="flex items-center">
              Page <strong className="mx-1">{page}</strong>
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
