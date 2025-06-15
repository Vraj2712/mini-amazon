// src/pages/ProductDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const resp = await axiosInstance.get(`/products/${productId}`);
        setProduct(resp.data);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.detail || "Could not load product. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    setSuccessMsg("");
    try {
      await axiosInstance.post("/cart/add", {
        product_id: product.id,
        quantity: 1,
      });
      setSuccessMsg("✔ Added to cart!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to add to cart.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading product…</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {error}
        <br />
        <button
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!product) {
    return <div className="p-4">Product not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      {product.image && (
        <img
          src={`http://localhost:8000${product.image}`}
          alt={product.name}
          className="w-full h-96 object-cover rounded"
        />
      )}

      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="text-gray-700">{product.description}</p>
      <div className="text-xl font-semibold">Price: ${product.price.toFixed(2)}</div>
      <div className="text-sm">
        {product.in_stock ? (
          <span className="text-green-600">In Stock</span>
        ) : (
          <span className="text-red-600">Out of Stock</span>
        )}
      </div>

      <button
        className={`mt-4 px-4 py-2 rounded text-white ${
          product.in_stock
            ? adding
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!product.in_stock || adding}
        onClick={handleAddToCart}
      >
        {adding ? "Adding…" : "Add to Cart"}
      </button>

      {successMsg && <div className="text-green-600 mt-2">{successMsg}</div>}
    </div>
  );
}
