// src/components/admin/UsersTab.jsx
import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const usersPerPage = 10;

  // Fetch all users
  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.get("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Toggle admin flag in the request body
  const toggleAdmin = async (id, isAdmin) => {
    try {
      await axiosInstance.put(`/admin/users/${id}/role`, { is_admin: !isAdmin });
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert("Could not update role");
    }
  };

  // Filter by name/email
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / usersPerPage));
  const pageSlice = useMemo(
    () =>
      filtered.slice(
        (page - 1) * usersPerPage,
        page * usersPerPage
      ),
    [filtered, page]
  );

  if (loading) return <p className="p-4">Loading users…</p>;
  if (error)   return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="flex-grow border rounded px-3 py-1"
        />
        <button
          onClick={() => setSearchTerm("")}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Clear
        </button>
      </div>

      {/* Users table */}
      <table className="w-full table-auto bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Admin</th>
            <th className="px-4 py-2 text-left">Created</th>
            <th className="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {pageSlice.map((u) => (
            <tr key={u.id} className="border-t even:bg-gray-50">
              <td className="px-4 py-2">{u.name}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.is_admin ? "Yes" : "No"}</td>
              <td className="px-4 py-2">
                {u.created_at
                  ? new Date(u.created_at).toLocaleString()
                  : "—"}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => toggleAdmin(u.id, u.is_admin)}
                  className={`px-3 py-1 rounded ${
                    u.is_admin
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {u.is_admin ? "Revoke" : "Make"} Admin
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded ${
              page === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>
          <span>Page <strong>{page}</strong> of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded ${
              page === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
