// src/pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useCart } from '../contexts/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchOne() {
      try {
        const resp = await axiosInstance.get(`/products/${id}`);
        setProduct(resp.data);
      } catch (err) {
        setError('Product not found');
      }
    }
    fetchOne();
  }, [id]);

  if (!product) {
    return <p>{error || 'Loading...'}</p>;
  }

  const handleAddToCart = () => {
    addToCart(product, qty);
    alert('Added to cart!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
      <p className="mb-4">{product.description}</p>
      <p className="text-xl mb-4">${product.price.toFixed(2)}</p>
      <div className="flex items-center space-x-2">
        <label>Quantity:</label>
        <input
          type="number"
          className="border px-2 py-1 w-16"
          min={1}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
        />
      </div>
      <button
        onClick={handleAddToCart}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Add to Cart
      </button>
    </div>
  );
}
