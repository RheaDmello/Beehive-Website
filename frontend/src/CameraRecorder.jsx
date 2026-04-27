import { useRef, useState } from "react";

export default function CameraRecorder() {
 const videoRef = useRef(null);
 const mediaRecorderRef = useRef(null);
 const [recording, setRecording] = useState(false);
 const [result, setResult] = useState(null);
 const [loading, setLoading] = useState(false);
 const chunksRef = useRef([]);

 // Start camera + recording
 const startRecording = async () => {
 setResult(null);
 chunksRef.current = [];

 const stream = await navigator.mediaDevices.getUserMedia({
 video: true,
 audio: false,
 });

 videoRef.current.srcObject = stream;
 videoRef.current.play();

 const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
 mediaRecorderRef.current = mediaRecorder;

 mediaRecorder.ondataavailable = (e) => {
 if (e.data.size > 0) chunksRef.current.push(e.data);
 };

 mediaRecorder.start();
 setRecording(true);
 };

 // Stop recording + send to backend
 const stopRecording = () => {
 const mediaRecorder = mediaRecorderRef.current;

 mediaRecorder.onstop = async () => {
 const blob = new Blob(chunksRef.current, { type: "video/webm" });

 // Stop camera stream
 videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
 videoRef.current.srcObject = null;

 // Send to FastAPI
 const formData = new FormData();
 formData.append("file", blob, "recording.webm");

 setLoading(true);
 try {
 const res = await fetch("http://localhost:8000/predict/video", {
 method: "POST",
 body: formData,
 });
 const data = await res.json();
 setResult(data);
 } catch (err) {
 setResult({ error: "Failed to connect to backend." });
 } finally {
 setLoading(false);
 }
 };

 mediaRecorder.stop();
 setRecording(false);
 };

 return (
 <div style={{ textAlign: "center", padding: "20px" }}>
 <h2>🐝 Beehive Video Detection</h2>

 <video
 ref={videoRef}
 width="480"
 height="360"
 muted
 style={{ border: "2px solid #ccc", borderRadius: "8px" }}
 />

 <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "center" }}>
 {!recording ? (
 <button
 onClick={startRecording}
 style={{ padding: "10px 24px", background: "#16a34a", color: "white", borderRadius: "6px", border: "none", cursor: "pointer" }}
 >
 ▶ Start Recording
 </button>
 ) : (
 <button
 onClick={stopRecording}
 style={{ padding: "10px 24px", background: "#dc2626", color: "white", borderRadius: "6px", border: "none", cursor: "pointer" }}
 >
 ⏹ Stop & Analyze
 </button>
 )}
 </div>

 {loading && <p style={{ marginTop: "16px" }}>⏳ Analyzing video...</p>}

 {result && !result.error && (
 <div style={{ marginTop: "20px", background: "#f0fdf4", padding: "16px", borderRadius: "8px", display: "inline-block" }}>
 <h3>📊 Detection Results</h3>
 <p>🐝 Bees detected: <strong>{result.detections.bee}</strong></p>
 <p>🐛 Wasps detected: <strong>{result.detections.wasp}</strong></p>
 <p>🌿 Other: <strong>{result.detections.other}</strong></p>
 <p>🏆 Dominant: <strong>{result.dominant_class.toUpperCase()}</strong></p>
 <p>🎞 Frames processed: <strong>{result.frames_processed}</strong></p>
 </div>
 )}

 {result?.error && (
 <p style={{ color: "red", marginTop: "16px" }}>❌ {result.error}</p>
 )}
 </div>
 );
}