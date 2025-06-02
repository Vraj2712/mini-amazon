// src/components/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * A very basic “card” that displays name, description, and price.
 * Clicking the product name navigates to /products/:id
 * which should load your ProductDetail page.
 */
export default function ProductCard({ product }) {
  // Make absolutely sure your backend really returns `id`, `name`, `price`, `description`.
  // If your backend’s model has a different field (e.g. `_id` or `title`), adjust accordingly.
  if (!product || !product.id) {
    return null;
  }

  return (
    <div className="border rounded-lg shadow-sm p-4 flex flex-col justify-between">
      <div>
        {/* Name (clickable) */}
        <h3 className="text-lg font-semibold mb-2">
          {/* 
            We assume product.id is the string you need to pass into your detail route:
            /products/{product.id}
          */}
          <Link to={`/products/${product.id}`} className="text-blue-600 hover:underline">
            {product.name}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-gray-700 mb-4">
          {product.description}
        </p>
      </div>

      {/* Price (formatted to two decimal places) */}
      <div className="mt-auto">
        <span className="text-xl font-bold">
          ${Number(product.price).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
