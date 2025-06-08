// src/components/admin/StatsTab.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function StatsTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axiosInstance.get("/admin/stats").then((res) => {
      setStats(res.data);
    });
    // no return → no cleanup
  }, []);

  if (!stats) return <p>Loading stats…</p>;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* …four stat cards… */}
    </div>
  );
}
