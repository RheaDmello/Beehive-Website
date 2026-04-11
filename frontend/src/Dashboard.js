import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "./Sidebar";

function Dashboard({ goBack }) {
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 bg-yellow-50 overflow-hidden">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/")}
            className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded-xl hover:bg-yellow-300"
          >
            ← 
          </button>

          <h1 className="text-xl font-bold text-yellow-700">
            🐝 Beehive Monitoring Dashboard
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          
          <div className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-yellow-400">
            <h3 className="text-yellow-600 text-sm">Audio Status</h3>
            <p className="text-lg font-bold mt-1">--</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-yellow-500">
            <h3 className="text-yellow-600 text-sm">Predator Detection</h3>
            <p className="text-lg font-bold mt-1">--</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-yellow-600">
            <h3 className="text-yellow-600 text-sm">Hive Status</h3>
            <p className="text-lg font-bold text-green-600 mt-1">--</p>
          </div>

        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          
          {/* Upload Section */}
          <div className="col-span-2 bg-white p-4 rounded-2xl shadow-md">
            <h2 className="text-md font-semibold text-yellow-700 mb-3">
              Upload Data
            </h2>

            {/* Audio Upload */}
            <div className="mb-3 p-2 bg-yellow-100 rounded-xl">
              <label className="block mb-1 text-sm font-medium text-yellow-700">
                Upload Audio
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files[0])}
              />
              <p className="text-xs text-gray-600">
                {audioFile ? audioFile.name : "No file selected"}
              </p>
            </div>

            {/* Video Upload */}
            <div className="mb-3 p-2 bg-yellow-100 rounded-xl">
              <label className="block mb-1 text-sm font-medium text-yellow-700">
                Upload Video
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
              <p className="text-xs text-gray-600">
                {videoFile ? videoFile.name : "No file selected"}
              </p>
            </div>

            {/* Analyze Button */}
            <button className="bg-yellow-500 text-white px-5 py-2 text-sm rounded-xl hover:bg-yellow-600 transition">
              Analyze Hive
            </button>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-4 rounded-2xl shadow-md">
            <h2 className="text-md font-semibold text-yellow-700 mb-3">
              Analysis Chart
            </h2>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={[
                  { name: "Audio", value: 80 },
                  { name: "Image", value: 65 },
                  { name: "Hive", value: 90 },
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#a16207"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h2 className="text-md font-semibold text-yellow-700 mb-3">
            Previous Analyses
          </h2>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-1 text-yellow-700">Audio</th>
                <th className="py-1 text-yellow-700">Image</th>
                <th className="py-1 text-yellow-700">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1">Queen Present</td>
                <td className="py-1">No Predator</td>
                <td className="py-1 text-green-600">Healthy</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;