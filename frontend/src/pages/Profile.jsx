// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // On mount, fetch /auth/user to populate fields
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError("");
      try {
        const resp = await axiosInstance.get("/auth/user");
        const data = resp.data;
        setName(data.name);
        setEmail(data.email);
        setCreatedAt(new Date(data.created_at).toLocaleString());
        setIsAdmin(data.is_admin);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile. Please log in again.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Build payload: only include fields if changed
    const payload = {};
    if (name.trim() !== "" && name !== user.name) {
      payload.name = name.trim();
    }
    if (password.trim() !== "") {
      payload.password = password;
    }

    if (Object.keys(payload).length === 0) {
      setError("No changes to save.");
      return;
    }

    try {
      const resp = await axiosInstance.put("/auth/user", payload);
      // On success, update local state with returned values
      setName(resp.data.name);
      setSuccessMsg("Profile updated successfully.");
      // Clear the password field after update
      setPassword("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to update profile.");
    }
  };

  if (loading) {
    return <div className="p-6">Loading profile…</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>

      {error && <p className="text-red-500">{error}</p>}
      {successMsg && <p className="text-green-600">{successMsg}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email (read‐only)</label>
          <input
            type="email"
            className="border p-2 w-full bg-gray-100"
            value={email}
            readOnly
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Created At</label>
          <input
            type="text"
            className="border p-2 w-full bg-gray-100"
            value={createdAt}
            readOnly
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Is Admin?</label>
          <input
            type="text"
            className="border p-2 w-full bg-gray-100"
            value={isAdmin ? "Yes" : "No"}
            readOnly
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">New Password</label>
          <input
            type="password"
            className="border p-2 w-full"
            placeholder="Leave blank to keep current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>

      <hr className="my-6" />
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Log Out
      </button>
    </div>
  );
}
