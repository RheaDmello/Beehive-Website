import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
 const navigate = useNavigate();

 // ── Audio states ──
 const [audioFile, setAudioFile] = useState(null);
 const [audioLoading, setAudioLoading] = useState(false);
 const [audioResult, setAudioResult] = useState(null);
 const [audioError, setAudioError] = useState(null);
 const audioInputRef = useRef(null);

 // ── Video states ──
 const [videoFile, setVideoFile] = useState(null);
 const [videoRecording, setVideoRecording] = useState(false);
 const [videoLoading, setVideoLoading] = useState(false);
 const [videoResult, setVideoResult] = useState(null);
 const [videoError, setVideoError] = useState(null);
 const chunksRef = useRef([]);
 const videoRef = useRef(null);
 const mediaRecorderRef = useRef(null);

 // ─────────────────────────────────────────
 // AUDIO UPLOAD HANDLER
 // ─────────────────────────────────────────
 const handleAudioChange = async (e) => {
 const file = e.target.files[0];
 if (!file) return;

 setAudioFile(file);
 setAudioResult(null);
 setAudioError(null);
 setAudioLoading(true);

 try {
 const formData = new FormData();
 formData.append("file", file);

 const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), 30000);

 const response = await fetch("http://localhost:8000/predict/audio", {
 method: "POST",
 body: formData,
 signal: controller.signal,
 });
 clearTimeout(timeout);

 if (!response.ok) throw new Error("Server error");
 const data = await response.json();
 if (data.error) throw new Error(data.error);
 setAudioResult(data);
 } catch (err) {
 if (err.name === "AbortError") {
 setAudioError("⏱️ Request timed out. Try a shorter audio file.");
 } else {
 setAudioError("❌ Failed to analyze audio. Make sure the backend is running.");
 }
 } finally {
 setAudioLoading(false);
 }
 };

 // ─────────────────────────────────────────
 // VIDEO FILE UPLOAD HANDLER
 // ─────────────────────────────────────────
 const handleVideoFileChange = async (e) => {
 const file = e.target.files[0];
 if (!file) return;

 if (file.size > 50 * 1024 * 1024) {
 setVideoError("⚠️ Video file is too large. Please upload a file under 50MB.");
 return;
 }

 setVideoFile(file);
 setVideoResult(null);
 setVideoError(null);
 setVideoLoading(true);

 try {
 const formData = new FormData();
 formData.append("file", file);

 const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), 120000);

 const res = await fetch("http://localhost:8000/predict/video", {
 method: "POST",
 body: formData,
 signal: controller.signal,
 });
 clearTimeout(timeout);

 const data = await res.json();
 if (data.error) throw new Error(data.error);
 setVideoResult(data);
 } catch (err) {
 if (err.name === "AbortError") {
 setVideoError("⏱️ Timed out. Try a shorter clip (under 30 seconds).");
 } else {
 setVideoError(`❌ Failed to analyze video: ${err.message}`);
 }
 } finally {
 setVideoLoading(false);
 }
 };

 // ─────────────────────────────────────────
 // WEBCAM RECORDING HANDLERS
 // ─────────────────────────────────────────
 const startRecording = async () => {
 setVideoResult(null);
 setVideoError(null);
 chunksRef.current = [];

 try {
 const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
 videoRef.current.srcObject = stream;
 videoRef.current.play();

 const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
 mediaRecorderRef.current = mediaRecorder;

 mediaRecorder.ondataavailable = (e) => {
 if (e.data.size > 0) chunksRef.current.push(e.data);
 };

 mediaRecorder.onstop = async () => {
 const blob = new Blob(chunksRef.current, { type: "video/webm" });
 stream.getTracks().forEach((t) => t.stop());
 videoRef.current.srcObject = null;
 setVideoLoading(true);

 try {
 const formData = new FormData();
 formData.append("file", blob, "recording.webm");

 const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), 120000);

 const res = await fetch("http://localhost:8000/predict/video", {
 method: "POST",
 body: formData,
 signal: controller.signal,
 });
 clearTimeout(timeout);

 const data = await res.json();
 if (data.error) throw new Error(data.error);
 setVideoResult(data);
 } catch (err) {
 if (err.name === "AbortError") {
 setVideoError("⏱️ Timed out. Try a shorter recording.");
 } else {
 setVideoError(`❌ Failed to analyze video: ${err.message}`);
 }
 } finally {
 setVideoLoading(false);
 }
 };

 mediaRecorder.start();
 setVideoRecording(true);
 } catch (err) {
 setVideoError("❌ Camera access denied. Please allow camera permission.");
 }
 };

 const stopRecording = () => {
 mediaRecorderRef.current?.stop();
 setVideoRecording(false);
 };

 return (
 <div className="min-h-screen bg-amber-50 text-stone-800 font-sans">

 {/* ── Navbar ── */}
 <nav className="bg-white shadow-sm sticky top-0 z-50">
 <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl">🐝</div>
 <span className="text-2xl font-bold">
 <span className="text-stone-800">Beehive</span>
 <span className="text-yellow-500"> AI</span>
 </span>
 </div>
 <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
 <a href="#" className="text-yellow-500 font-semibold">Home</a>
 <a href="#features" className="hover:text-yellow-500 transition">Features</a>
 <a href="#models" className="hover:text-yellow-500 transition">AI Models</a>
 <a href="#upload" className="hover:text-yellow-500 transition">Upload</a>
 <button onClick={() => navigate("/dashboard")} className="hover:text-yellow-500 transition">
 Dashboard
 </button>
 </div>
 </div>
 </nav>

 {/* ── Hero ── */}
 <section className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10 min-h-[85vh]">
 <div className="flex-1 flex justify-center items-center relative">
 <div className="relative w-80 h-80 select-none">
 <div className="absolute top-8 left-16 text-[120px]">🍯</div>
 <div className="absolute bottom-4 left-4 text-[64px] animate-bounce">🐝</div>
 <div className="absolute top-4 right-4 text-[48px] animate-pulse">🐝</div>
 <div className="absolute bottom-16 right-8 text-[40px]">🐝</div>
 </div>
 </div>
 <div className="flex-1 max-w-xl">
 <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
 AI-Powered{" "}
 <span className="text-yellow-500">Beehive Monitoring</span>
 </h1>
 <p className="text-stone-500 text-lg mb-8 leading-relaxed">
 Beehive AI uses advanced deep learning to analyze hive audio and video
 recordings and detect overall Hive Health with high accuracy.
 </p>
 <button
 onClick={() => navigate("/dashboard")}
 className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold rounded-full text-base transition shadow-md"
 >
 View Dashboard
 </button>
 </div>
 </section>

 {/* ── How It Works ── */}
 <section id="features" className="bg-white py-20 px-6">
 <div className="max-w-7xl mx-auto">
 <h2 className="text-4xl font-extrabold text-center mb-3">
 How <span className="text-yellow-500">Beehive AI</span> Works
 </h2>
 <p className="text-center text-stone-500 mb-12">
 Three simple steps from audio & video to deep learning insight.
 </p>
 <div className="grid md:grid-cols-3 gap-8">
 {[
 { icon: "🎵", title: "Audio & Video Analysis", desc: "Extract acoustic features like MFCCs and spectral characteristics from hive recordings and visual features from bee videos." },
 { icon: "🧠", title: "Deep Learning Classification", desc: "Our deep learning models process acoustic and visual data to identify queen bee patterns with high precision." },
 { icon: "✅", title: "Accurate Results", desc: "Get clear insights about queen bee presence with visual data representations." },
 ].map((item, i) => (
 <div key={i} className="bg-white border border-stone-100 rounded-2xl p-8 shadow-md hover:shadow-lg transition text-center">
 <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">{item.icon}</div>
 <h3 className="text-lg font-bold text-stone-800 mb-3">{item.title}</h3>
 <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ── AI Models ── */}
 <section id="models" className="bg-amber-50 py-20 px-6">
 <div className="max-w-7xl mx-auto">
 <h2 className="text-4xl font-extrabold text-center mb-3">
 Our <span className="text-yellow-500">Models</span> Include
 </h2>
 <p className="text-center text-stone-500 mb-12 max-w-2xl mx-auto">
 Beehive AI offers two powerful deep learning approaches for non-invasive Hive Health Monitoring.
 </p>
 <div className="grid md:grid-cols-2 gap-8">

 {/* YOLOv8 */}
 <div className="bg-white rounded-2xl p-8 shadow-md border border-stone-100">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl">📹</div>
 <div>
 <h3 className="text-xl font-bold text-stone-800">YOLOv8 Object Detection</h3>
 <p className="text-blue-500 text-sm font-semibold">Computer Vision AI</p>
 </div>
 </div>
 <ul className="space-y-4 mb-6">
 {[
 { icon: "⚡", title: "Real-Time Detection", desc: "Detects bee/wasp presence frame-by-frame in hive video recordings instantly" },
 { icon: "🎯", title: "High Precision Localization", desc: "Pinpoints exact location within the hive using bounding boxes" },
 { icon: "🎬", title: "Video Analysis", desc: "Processes .mp4 and video files to track bee activity" },
 ].map((f, i) => (
 <li key={i} className="flex gap-3">
 <span className="text-blue-400 mt-0.5">{f.icon}</span>
 <div>
 <p className="font-semibold text-stone-800 text-sm">{f.title}</p>
 <p className="text-stone-500 text-xs">{f.desc}</p>
 </div>
 </li>
 ))}
 </ul>
 <div className="bg-blue-50 rounded-xl p-4 text-sm">
 <p className="font-bold text-stone-700 mb-1">Best For:</p>
 <p className="text-stone-500">Users who have hive video footage and want visual, frame-level detection.</p>
 </div>
 </div>

 {/* CNN */}
 <div className="bg-white rounded-2xl p-8 shadow-md border border-stone-100">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">🧠</div>
 <div>
 <h3 className="text-xl font-bold text-stone-800">Convolutional Neural Network</h3>
 <p className="text-yellow-500 text-sm font-semibold">Deep Learning AI</p>
 </div>
 </div>
 <ul className="space-y-4 mb-6">
 {[
 { icon: "🔍", title: "Deep Pattern Recognition", desc: "Automatically learns complex acoustic patterns and relationships" },
 { icon: "🏆", title: "Superior Accuracy", desc: "Advanced neural networks for potentially higher detection precision" },
 { icon: "📊", title: "Spectral Analysis", desc: "Processes raw spectrogram data to identify subtle audio signatures" },
 ].map((f, i) => (
 <li key={i} className="flex gap-3">
 <span className="text-yellow-500 mt-0.5">{f.icon}</span>
 <div>
 <p className="font-semibold text-stone-800 text-sm">{f.title}</p>
 <p className="text-stone-500 text-xs">{f.desc}</p>
 </div>
 </li>
 ))}
 </ul>
 <div className="bg-yellow-50 rounded-xl p-4 text-sm">
 <p className="font-bold text-stone-700 mb-1">Best For:</p>
 <p className="text-stone-500">Users seeking the highest possible accuracy from hive audio recordings.</p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ── Upload Section ── */}
 <section id="upload" className="bg-white py-20 px-6">
 <div className="max-w-4xl mx-auto text-center">
 <h2 className="text-4xl font-extrabold mb-3">Upload Hive Audio & Video</h2>
 <p className="text-stone-500 mb-12">
 Upload your hive recordings or use your mic and webcam — Beehive AI will analyze them for Hive Health.
 </p>

 <div className="grid md:grid-cols-2 gap-8">

 {/* ── Audio Card ── */}
 <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 shadow-sm flex flex-col gap-5">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">🎵</div>
 <div className="text-left">
 <h3 className="text-lg font-bold text-stone-800">Audio Analysis</h3>
 <p className="text-stone-500 text-xs">CNN Model — .wav / .mp3 supported</p>
 </div>
 </div>

 {/* Upload Drop Zone */}
 <div
 onClick={() => audioInputRef.current.click()}
 className="bg-white border-2 border-dashed border-yellow-300 rounded-xl p-5 text-center cursor-pointer hover:border-yellow-400 transition"
 >
 <input
 type="file"
 accept="audio/*"
 ref={audioInputRef}
 className="hidden"
 onChange={handleAudioChange}
 />
 <div className="flex flex-col items-center gap-2">
 <span className="text-3xl">📂</span>
 <p className="text-sm font-semibold text-stone-700">
 {audioFile ? `✅ ${audioFile.name}` : "Click to Upload Audio File"}
 </p>
 <p className="text-xs text-stone-400">.wav, .mp3 — max 50MB</p>
 </div>
 </div>

 {/* Loading */}
 {audioLoading && (
 <div className="flex flex-col items-center gap-2 py-2">
 <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
 <p className="text-sm text-stone-500 font-medium">Analyzing audio with CNN model...</p>
 </div>
 )}

 {/* Error */}
 {audioError && (
 <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
 {audioError}
 </div>
 )}

 {/* Result */}
 {audioResult && !audioLoading && (
 <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left flex flex-col gap-3">
 <div className="flex items-center gap-2">
 <span className="text-2xl">
 {audioResult.predicted_class === "QUEEN BEE PRESENT" ? "👑" : "🚫"}
 </span>
 <div>
 <p className="font-bold text-stone-800 text-sm">
 Result: <span className="text-green-700">{audioResult.predicted_class}</span>
 </p>
 <p className="text-xs text-stone-500">Confidence: {audioResult.confidence}%</p>
 <p className="text-xs text-stone-500">
 Queen Probability: {(audioResult.queen_probability * 100).toFixed(2)}%
 </p>
 </div>
 </div>
 <button
 onClick={() => navigate("/dashboard", { state: { audioResult } })}
 className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold rounded-xl transition text-sm"
 >
 📊 View Full Analysis in Dashboard →
 </button>
 </div>
 )}

 {/* OR divider */}
 <div className="flex items-center gap-3">
 <div className="flex-1 h-px bg-stone-200" />
 <span className="text-stone-400 text-xs font-semibold">OR</span>
 <div className="flex-1 h-px bg-stone-200" />
 </div>

 {/* Mic button */}
 <button
 onClick={() => {
 navigator.mediaDevices.getUserMedia({ audio: true })
 .then(() => alert("🎙️ Microphone access granted! Ready to record."))
 .catch(() => alert("Microphone access denied."));
 }}
 className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold transition shadow"
 >
 🎙️ Open Microphone
 </button>
 <p className="text-xs text-stone-400 -mt-2">
 Record live audio directly from your device microphone
 </p>
 </div>

 {/* ── Video Card ── */}
 <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 shadow-sm flex flex-col gap-5">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">📹</div>
 <div className="text-left">
 <h3 className="text-lg font-bold text-stone-800">Video Analysis</h3>
 <p className="text-stone-500 text-xs">YOLOv8 Model — .mp4 / .mov supported (max 50MB)</p>
 </div>
 </div>

 {/* Upload Drop Zone */}
 <div className="bg-white border-2 border-dashed border-blue-300 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 transition">
 <input
 type="file"
 accept="video/*"
 id="videoUpload"
 className="hidden"
 onChange={handleVideoFileChange}
 />
 <label htmlFor="videoUpload" className="cursor-pointer flex flex-col items-center gap-2">
 <span className="text-3xl">📂</span>
 <p className="text-sm font-semibold text-stone-700">
 {videoFile ? `✅ ${videoFile.name}` : "Click to Upload Video File"}
 </p>
 <p className="text-xs text-stone-400">.mp4, .mov — max 50MB</p>
 </label>
 </div>

 {/* OR divider */}
 <div className="flex items-center gap-3">
 <div className="flex-1 h-px bg-stone-200" />
 <span className="text-stone-400 text-xs font-semibold">OR</span>
 <div className="flex-1 h-px bg-stone-200" />
 </div>

 {/* Webcam preview */}
 <video
 ref={videoRef}
 muted
 className="w-full rounded-xl bg-black"
 style={{ minHeight: "160px", display: videoRecording ? "block" : "none" }}
 />

 {videoRecording && (
 <div className="flex items-center gap-2 text-red-500 text-sm font-semibold">
 <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse inline-block" />
 Recording...
 </div>
 )}

 {!videoRecording ? (
 <button
 onClick={startRecording}
 className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-bold transition shadow"
 >
 📷 Open Webcam & Record
 </button>
 ) : (
 <button
 onClick={stopRecording}
 className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition shadow"
 >
 ⏹ Stop & Analyze
 </button>
 )}

 {/* Loading */}
 {videoLoading && (
 <div className="flex flex-col items-center gap-2 py-2">
 <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
 <p className="text-sm text-stone-500 font-medium">Analyzing video with YOLOv8...</p>
 </div>
 )}

 {/* Error */}
 {videoError && (
 <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
 {videoError}
 </div>
 )}

 {/* Result */}
{/* Result */}
{videoResult && !videoLoading && (
 <div className={`border rounded-xl p-4 text-left flex flex-col gap-3 ${
 videoResult.predicted_class === "BEE"
 ? "bg-yellow-50 border-yellow-200"
 : "bg-orange-50 border-orange-200"
 }`}>
 <div className="flex items-center gap-3">
 <span className="text-4xl">
 {videoResult.predicted_class === "BEE" ? "🐝" : "🐛"}
 </span>
 <div>
 <p className="font-bold text-stone-800 text-sm">
 Detected:{" "}
 <span className={videoResult.predicted_class === "BEE" ? "text-yellow-600" : "text-orange-600"}>
 {videoResult.predicted_class}
 </span>
 </p>
 <p className="text-xs text-stone-500">Confidence: {videoResult.confidence}%</p>
 <p className="text-xs text-stone-500">🏠 {videoResult.hive_health}</p>
 <p className="text-xs text-stone-400">
 🎞 {videoResult.frames_analyzed} frames analyzed
 </p>
 </div>
 </div>
 <button
 onClick={() => navigate("/dashboard", { state: { videoResult } })}
 className="w-full py-2 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-xl transition text-sm"
 >
 📊 View Full Analysis in Dashboard →
 </button>
 </div>
)}
 <p className="text-xs text-stone-400 -mt-2">
 Record live video directly from your device webcam
 </p>
 </div>
 </div>

 {/* Tip */}
 <div className="mt-8 flex items-start gap-3 bg-amber-50 rounded-xl p-4 text-left text-sm text-stone-600 border border-amber-100">
 <span className="text-yellow-500 text-lg">ℹ️</span>
 <p>
 For optimal results, audio recordings should be <strong>10–30 seconds</strong> from near the hive center.
 Video should be <strong>under 50MB</strong> and capture the full hive interior with good lighting.
 </p>
 </div>
 </div>
 </section>

 {/* ── Footer ── */}
 <footer className="bg-white border-t border-stone-100 px-6 py-8">
 <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
 <div>
 <p className="text-xl font-bold">
 <span className="text-stone-800">Beehive</span>
 <span className="text-yellow-500"> AI</span>
 </p>
 <p className="text-stone-500 text-sm">AI-powered Queen Bee detection</p>
 </div>
 <p className="text-stone-400 text-sm">© 2026 Beehive AI. All rights reserved.</p>
 </div>
 </footer>
 </div>
 );
}

export default Home;