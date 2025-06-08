// src/components/admin/UsersTab.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function UsersTab() {
  const [users, setUsers] = useState([]);

  const loadUsers = () =>
    axiosInstance.get("/admin/users").then((res) => setUsers(res.data));

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleAdmin = async (id, isAdmin) => {
    await axiosInstance.put(`/admin/users/${id}/role`, null, {
      params: { is_admin: !isAdmin },
    });
    loadUsers();
  };

  return (
    <table className="w-full table-auto bg-white rounded shadow">
      {/* …table head… */}
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="even:bg-gray-50">
            <td className="px-4 py-2">{u.name}</td>
            <td className="px-4 py-2">{u.email}</td>
            <td className="px-4 py-2">{u.is_admin ? "Yes" : "No"}</td>
            <td className="px-4 py-2">
              <button
                onClick={() => toggleAdmin(u.id, u.is_admin)}
                className="px-2 py-1 bg-blue-600 text-white rounded"
              >
                {u.is_admin ? "Revoke" : "Make"} Admin
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
