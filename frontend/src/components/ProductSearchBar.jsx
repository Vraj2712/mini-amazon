// src/components/ProductSearchBar.jsx
import React, { useState } from "react";

export default function ProductSearchBar({ onSearch }) {
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass filters up
    onSearch({
      q: q.trim() || undefined,
      min_price: minPrice !== "" ? Number(minPrice) : undefined,
      max_price: maxPrice !== "" ? Number(maxPrice) : undefined,
      in_stock: inStock ? true : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-x-4 flex items-end mb-6">
      <div>
        <label className="block text-sm">Search</label>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border p-1"
          placeholder="Product name…"
        />
      </div>
      <div>
        <label className="block text-sm">Min Price</label>
        <input
          type="number"
          min="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border p-1 w-20"
        />
      </div>
      <div>
        <label className="block text-sm">Max Price</label>
        <input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border p-1 w-20"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="inStock"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="mr-1"
        />
        <label htmlFor="inStock" className="text-sm">In Stock</label>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
      >
        Filter
      </button>
    </form>
  );
}
