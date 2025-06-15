// src/components/ProductCard.jsx

import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  if (!product || !product.id) {
    return null;
  }

  // 🔧 Build image URL only if product.image exists
  const imageUrl = product.image 
    ? `http://localhost:8000${product.image}` 
    : null;

  return (
    <div className="border rounded-lg shadow-sm p-4 flex flex-col justify-between">
      {/* Image rendering */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-40 object-cover mb-3 rounded"
        />
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">
          <Link to={`/products/${product.id}`} className="text-blue-600 hover:underline">
            {product.name}
          </Link>
        </h3>

        <p className="text-gray-700 mb-4">{product.description}</p>
      </div>

      <div className="mt-auto">
        <span className="text-xl font-bold">
          ${Number(product.price).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
