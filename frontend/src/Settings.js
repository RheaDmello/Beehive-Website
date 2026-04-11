import React from "react";
import Sidebar from "./Sidebar";

function Settings() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-yellow-50">
        <h1 className="text-2xl font-bold text-yellow-700 mb-4">
          Settings
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow">
          <label className="block mb-2">Enable Alerts</label>
          <input type="checkbox" />

          <label className="block mt-4 mb-2">Threshold</label>
          <input type="range" className="w-full" />
        </div>
      </div>
    </div>
  );
}

export default Settings;