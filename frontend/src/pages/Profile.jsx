// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth(); // user.email, user.name, user.id
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // In case user object changes, sync local name field
  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Build the payload only including changed fields
      const payload = {};
      if (name && name !== user.name) payload.name = name;
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        setError("No changes to save.");
        return;
      }

      const resp = await axiosInstance.put("/auth/user", payload);
      setMessage("Profile updated successfully.");
      // Optionally force a re-login if password changed:
      if (payload.password) {
        setMessage("Password updated. Please log in again.");
        logout();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to update profile.");
    }
  };

  if (!user) {
    return <p className="p-6">Loading profile…</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display email (read-only) */}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={user.email}
            readOnly
            className="border p-2 w-full bg-gray-100"
          />
        </div>
        {/* Update name */}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        {/* Update password */}
        <div>
          <label className="block mb-1 font-medium">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
            placeholder="Leave blank to keep current"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border p-2 w-full"
            placeholder="Re-enter new password"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
