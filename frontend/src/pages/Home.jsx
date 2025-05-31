// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const resp = await axiosInstance.get('/products/');
        setProducts(resp.data);
      } catch (err) {
        setError('Failed to load products.');
      }
    }
    fetchProducts();
  }, []);

  return (
    <div>
      <h2 className="text-2xl mb-4">All Products</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}
