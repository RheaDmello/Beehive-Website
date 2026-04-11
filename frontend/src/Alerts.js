import React from "react";
import Sidebar from "./Sidebar";

function Alerts() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-yellow-50">
        <h1 className="text-2xl font-bold text-yellow-700 mb-4">
          Alerts
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow space-y-3">
          <div className="bg-red-100 p-3 rounded-xl">
            ⚠ Predator detected
          </div>
          <div className="bg-yellow-100 p-3 rounded-xl">
            ⚠ Queen missing earlier
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;