// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="border rounded shadow p-4 hover:shadow-lg transition">
      <Link to={`/product/${product.id}`}>
        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
      </Link>
      <p className="mb-2">${product.price.toFixed(2)}</p>
      <p className="text-sm text-gray-600">{product.description}</p>
      <Link
        to={`/product/${product.id}`}
        className="mt-2 block bg-blue-500 text-white text-center py-1 rounded"
      >
        View Details
      </Link>
    </div>
  );
}
