import React from "react";
import Sidebar from "./Sidebar";

function Monitoring() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-yellow-50">
        <h1 className="text-2xl font-bold text-yellow-700 mb-4">
          Live Monitoring
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p>🎧 Audio Feed Active</p>
          <p>📹 Video Feed Active</p>
          <p className="text-green-600 font-bold mt-2">
            Hive Stable 🐝
          </p>
        </div>
      </div>
    </div>
  );
}

export default Monitoring;