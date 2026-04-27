import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

function Dashboard() {
 const navigate = useNavigate();
 const location = useLocation();

 const audioResult = location.state?.audioResult || null;
 const videoResult = location.state?.videoResult || null;

 // ── Load history from localStorage ──
 const [history, setHistory] = useState(() => {
 try {
 return JSON.parse(localStorage.getItem("beehiveHistory")) || [];
 } catch {
 return [];
 }
 });

 const hasSaved = useRef(false);

 useEffect(() => {
 if ((audioResult || videoResult) && !hasSaved.current) {
 hasSaved.current = true;

 const entries = [];

 if (audioResult) {
 entries.push({
 id: Date.now(),
 type: "Audio",
 model: "CNN",
 result: audioResult.predicted_class,
 confidence: audioResult.confidence,
 timestamp: new Date().toLocaleString(),
 status: audioResult.predicted_class === "QUEEN BEE PRESENT" ? "Healthy" : "No Queen",
 });
 }

 if (videoResult) {
 entries.push({
 id: Date.now() + 1,
 type: "Video",
 model: "YOLOv8",
 result: videoResult.dominant_class?.toUpperCase() || "N/A",
 confidence: videoResult.total_detections > 0
 ? Math.round((videoResult.detections?.[videoResult.dominant_class] / videoResult.total_detections) * 100)
 : 0,
 timestamp: new Date().toLocaleString(),
 status: videoResult.dominant_class === "bee" ? "Healthy"
 : videoResult.dominant_class === "wasp" ? "Threat"
 : "Unknown",
 });
 }

 setHistory((prev) => {
 const updated = [...entries, ...prev].slice(0, 20);
 localStorage.setItem("beehiveHistory", JSON.stringify(updated));
 return updated;
 });
 }
 }, [audioResult, videoResult]);

 const clearHistory = () => {
 localStorage.removeItem("beehiveHistory");
 setHistory([]);
 };

 // ── Audio status helper ──
 const getAudioStatus = () => {
 if (!audioResult) return { label: "-- No Data", color: "text-stone-400" };
 if (audioResult.predicted_class === "QUEEN BEE PRESENT") return { label: "👑 Queen Present", color: "text-green-600" };
 return { label: "🚫 No Queen", color: "text-red-500" };
 };

 // ── Video status helper ──
 const getVideoStatus = () => {
 if (!videoResult) return { label: "-- No Data", color: "text-stone-400" };
 if (videoResult.dominant_class === "bee") return { label: "🐝 Bee Dominant", color: "text-green-600" };
 if (videoResult.dominant_class === "wasp") return { label: "🐛 Wasp Dominant", color: "text-orange-500" };
 return { label: "🌿 Other", color: "text-stone-500" };
 };

 const audioStatus = getAudioStatus();
 const videoStatus = getVideoStatus();

 // ── Overall hive status ──
 const getHiveStatus = () => {
 if (!audioResult && !videoResult) return { label: "--", color: "text-stone-400" };
 if (audioResult?.predicted_class === "QUEEN BEE PRESENT" && videoResult?.dominant_class === "bee")
 return { label: "✅ Healthy", color: "text-green-600" };
 if (audioResult?.predicted_class === "NO QUEEN BEE")
 return { label: "⚠️ No Queen Detected", color: "text-orange-500" };
 if (videoResult?.dominant_class === "wasp")
 return { label: "⚠️ Wasp Threat", color: "text-orange-500" };
 if (audioResult?.predicted_class === "QUEEN BEE PRESENT")
 return { label: "✅ Healthy", color: "text-green-600" };
 return { label: "ℹ️ Review Needed", color: "text-stone-500" };
 };

 const hiveStatus = getHiveStatus();

 return (
 <div className="flex h-screen overflow-hidden">
 <Sidebar />

 <div className="flex-1 p-6 bg-yellow-50 overflow-auto">

 {/* ── Top Bar ── */}
 <div className="flex items-center justify-between mb-6">
 <button
 onClick={() => navigate("/")}
 className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded-xl hover:bg-yellow-300 font-medium"
 >
 ← Back
 </button>
 <h1 className="text-xl font-bold text-yellow-700">🐝 Beehive Monitoring Dashboard</h1>
 </div>

 {/* ── Result Banners ── */}
 <div className="flex flex-col gap-4 mb-6">

 {/* Audio Banner */}
 {audioResult && (
 <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${
 audioResult.predicted_class === "QUEEN BEE PRESENT"
 ? "bg-green-50 border-green-200"
 : "bg-red-50 border-red-200"
 }`}>
 <span className="text-5xl">{audioResult.predicted_class === "QUEEN BEE PRESENT" ? "👑" : "🚫"}</span>
 <div>
 <p className="font-bold text-stone-800 text-lg">🎵 Audio Analysis Complete</p>
 <p className="text-stone-600 text-sm mt-1">
 Detected: <strong className={audioStatus.color}>{audioResult.predicted_class}</strong>
 &nbsp;|&nbsp; Confidence: <strong>{audioResult.confidence}%</strong>
 &nbsp;|&nbsp; Queen Probability: <strong>{(audioResult.queen_probability * 100).toFixed(2)}%</strong>
 </p>
 </div>
 </div>
 )}

 {/* Video Banner */}
 {videoResult && (
 <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${
 videoResult.dominant_class === "bee"
 ? "bg-yellow-50 border-yellow-200"
 : videoResult.dominant_class === "wasp"
 ? "bg-orange-50 border-orange-200"
 : "bg-stone-50 border-stone-200"
 }`}>
 <span className="text-5xl">
 {videoResult.dominant_class === "bee" ? "🐝" : videoResult.dominant_class === "wasp" ? "🐛" : "🌿"}
 </span>
 <div>
 <p className="font-bold text-stone-800 text-lg">📹 Video Analysis Complete</p>
 <p className="text-stone-600 text-sm mt-1">
 Dominant: <strong className={videoStatus.color}>{videoResult.dominant_class?.toUpperCase()}</strong>
 &nbsp;|&nbsp; Bees: <strong>{videoResult.detections?.bee ?? 0}</strong>
 &nbsp;|&nbsp; Wasps: <strong>{videoResult.detections?.wasp ?? 0}</strong>
 &nbsp;|&nbsp; Frames: <strong>{videoResult.frames_processed}</strong>
 </p>
 </div>
 </div>
 )}
 </div>

 {/* ── Stats Cards ── */}
 <div className="grid grid-cols-3 gap-4 mb-6">

 {/* Audio Status */}
 <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-yellow-400">
 <h3 className="text-yellow-600 text-sm font-medium">🎵 Audio Status</h3>
 <p className={`text-lg font-bold mt-1 ${audioStatus.color}`}>{audioStatus.label}</p>
 {audioResult && (
 <p className="text-xs text-stone-400 mt-1">{audioResult.confidence}% confidence</p>
 )}
 </div>

 {/* Video Status */}
 <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-blue-400">
 <h3 className="text-blue-600 text-sm font-medium">📹 Video Status</h3>
 <p className={`text-lg font-bold mt-1 ${videoStatus.color}`}>{videoStatus.label}</p>
 {videoResult && (
 <p className="text-xs text-stone-400 mt-1">
 {videoResult.total_detections} detections · {videoResult.frames_processed} frames
 </p>
 )}
 </div>

 {/* Hive Status */}
 <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-yellow-600">
 <h3 className="text-yellow-600 text-sm font-medium">🏠 Hive Status</h3>
 <p className={`text-lg font-bold mt-1 ${hiveStatus.color}`}>{hiveStatus.label}</p>
 <p className="text-xs text-stone-400 mt-1">Combined analysis</p>
 </div>
 </div>

 {/* ── Video Detection Breakdown (if video result exists) ── */}
 {videoResult && (
 <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
 <h2 className="text-md font-semibold text-blue-700 mb-4">📹 Video Detection Breakdown</h2>
 <div className="grid grid-cols-3 gap-4">
 <div className="bg-yellow-50 rounded-xl p-4 text-center">
 <p className="text-3xl font-bold text-yellow-500">{videoResult.detections?.bee ?? 0}</p>
 <p className="text-xs text-stone-500 mt-1">🐝 Bees</p>
 </div>
 <div className="bg-orange-50 rounded-xl p-4 text-center">
 <p className="text-3xl font-bold text-orange-500">{videoResult.detections?.wasp ?? 0}</p>
 <p className="text-xs text-stone-500 mt-1">🐛 Wasps</p>
 </div>
 <div className="bg-stone-50 rounded-xl p-4 text-center">
 <p className="text-3xl font-bold text-stone-500">{videoResult.detections?.other ?? 0}</p>
 <p className="text-xs text-stone-500 mt-1">🌿 Other</p>
 </div>
 </div>
 </div>
 )}

 {/* ── Analysis History ── */}
 <div className="bg-white p-6 rounded-2xl shadow-md">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-md font-semibold text-yellow-700">📋 Analysis History</h2>
 {history.length > 0 && (
 <button
 onClick={clearHistory}
 className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1 rounded-lg transition"
 >
 🗑 Clear History
 </button>
 )}
 </div>

 {history.length === 0 ? (
 <div className="text-center py-12 text-stone-400">
 <p className="text-4xl mb-3">📂</p>
 <p className="font-medium">No analyses yet.</p>
 <p className="text-sm mt-1">Upload an audio or video file from the home page to get started.</p>
 <button
 onClick={() => navigate("/")}
 className="mt-4 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold rounded-full text-sm transition"
 >
 Go to Upload
 </button>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="border-b border-stone-100">
 <th className="py-3 px-2 text-yellow-700 font-semibold">#</th>
 <th className="py-3 px-2 text-yellow-700 font-semibold">Type</th>
 <th className="py-3 px-2 text-yellow-700 font-semibold">Model</th>
 <th className="py-3 px-2 text-yellow-700 font-semibold">Result</th>
 <th className="py-3 px-2 text-yellow-700 font-semibold">Confidence</th>
 <th className="py-3 px-2 text-yellow-700 font-semibold">Hive Status</th>
 <th className="py-3 px-2 text-yellow-700 font-semibold">Date & Time</th>
 </tr>
 </thead>
 <tbody>
 {history.map((entry, i) => (
 <tr key={entry.id} className="border-b border-stone-50 hover:bg-yellow-50 transition">
 <td className="py-3 px-2 text-stone-400">{i + 1}</td>
 <td className="py-3 px-2">
 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
 entry.type === "Audio"
 ? "bg-yellow-100 text-yellow-700"
 : "bg-blue-100 text-blue-700"
 }`}>
 {entry.type === "Audio" ? "🎵 Audio" : "📹 Video"}
 </span>
 </td>
 <td className="py-3 px-2 text-stone-600">{entry.model}</td>
 <td className="py-3 px-2 font-semibold text-stone-800">{entry.result}</td>
 <td className="py-3 px-2">
 <div className="flex items-center gap-2">
 <div className="w-20 h-2 bg-stone-100 rounded-full overflow-hidden">
 <div
 className="h-full bg-yellow-400 rounded-full"
 style={{ width: `${entry.confidence}%` }}
 />
 </div>
 <span className="text-stone-600 text-xs">{entry.confidence}%</span>
 </div>
 </td>
 <td className="py-3 px-2">
 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
 entry.status === "Healthy" ? "bg-green-100 text-green-700"
 : entry.status === "Threat" ? "bg-orange-100 text-orange-700"
 : "bg-red-100 text-red-600"
 }`}>
 {entry.status === "Healthy" ? "✅ Healthy"
 : entry.status === "Threat" ? "⚠️ Threat"
 : entry.status === "No Queen" ? "⚠️ No Queen"
 : "❓ Unknown"}
 </span>
 </td>
 <td className="py-3 px-2 text-stone-400 text-xs">{entry.timestamp}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 </div>
 </div>
 );
}

export default Dashboard;