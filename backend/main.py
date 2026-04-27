from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import librosa
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelEncoder
import tempfile
import os
import cv2
from ultralytics import YOLO

app = FastAPI()

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load CNN Audio Model ──
AUDIO_MODEL_PATH = "/Users/rhea.dmello/Desktop/Code/Beehive Project/backend/bee1.h5"
audio_model = load_model(AUDIO_MODEL_PATH)

encoder = LabelEncoder()
encoder.fit(["bee", "nobee", "noqueen"])

# ── Load Custom YOLOv8 Model ──
# ⚠️ Replace yolov8n.pt with your custom trained model (best.pt)
# Your model MUST have classes: 0=bee, 1=wasp, 2=other
# yolov8n.pt is a COCO model — it has NO bee/wasp classes and will NEVER detect them
YOLO_MODEL_PATH = "/Users/rhea.dmello/Desktop/Code/Beehive Project/backend/yolov8_bee_wasp_repacked (2).pt"
yolo_model = YOLO(YOLO_MODEL_PATH)

# ── Verify model classes on startup ──
print(f"✅ YOLO model loaded.")
print(f"   Classes: {yolo_model.names}")
print(f"   Expected: {{0: 'bee', 1: 'wasp', 2: 'other'}}")

BEE_CLASS_NAMES  = {"bee"}
WASP_CLASS_NAMES = {"wasp"}


# ─────────────────────────────────────────
# AUDIO FEATURE EXTRACTION
# ─────────────────────────────────────────
def extract_features(file_path, n_mfcc=40, target_sr=16000):
    try:
        audio_data, original_sr = librosa.load(file_path, sr=None)

        audio_data = librosa.resample(
            audio_data,
            orig_sr=original_sr,
            target_sr=target_sr,
        )

        mfccs = librosa.feature.mfcc(
            y=audio_data,
            sr=target_sr,
            n_mfcc=n_mfcc,
        )

        mfccs_scaled = np.mean(mfccs.T, axis=0)
        return mfccs_scaled

    except Exception as e:
        print(f"Audio feature extraction error: {e}")
        return None


# ─────────────────────────────────────────
# AUDIO PREDICTION ENDPOINT
# ─────────────────────────────────────────
@app.post("/predict/audio")
async def predict_audio(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        features = extract_features(tmp_path)

        if features is None:
            return {"error": "Failed to extract features from audio."}

        features = features.reshape(1, -1)
        prediction = audio_model.predict(features, verbose=0)

        predicted_index = np.argmax(prediction)
        predicted_class = encoder.inverse_transform([predicted_index])[0]
        confidence = float(np.max(prediction) * 100)

        classes = encoder.classes_
        probs = {
            cls: round(float(prediction[0][i]) * 100, 2)
            for i, cls in enumerate(classes)
        }

        label_map = {
            "bee":     "QUEEN BEE PRESENT",
            "nobee":   "NO BEE DETECTED",
            "noqueen": "NO QUEEN BEE",
        }

        return {
            "predicted_class": label_map.get(
                predicted_class, predicted_class.upper()
            ),
            "confidence":        round(confidence, 2),
            "queen_probability": round(float(prediction[0][predicted_index]), 4),
            "all_probabilities": probs,
        }

    finally:
        os.unlink(tmp_path)


# ─────────────────────────────────────────
# VIDEO PREDICTION ENDPOINT
# Custom YOLO → 0=bee, 1=wasp, 2=other
# ─────────────────────────────────────────
@app.post("/predict/video")
async def predict_video(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1] or ".mp4"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        cap = cv2.VideoCapture(tmp_path)

        if not cap.isOpened():
            return {"error": "Could not open video file."}

        bee_score  = 0.0
        wasp_score = 0.0

        frames_processed = 0
        analyzed_frames  = 0

        MAX_FRAMES_TO_ANALYZE = 30
        frame_skip            = 10

        while analyzed_frames < MAX_FRAMES_TO_ANALYZE:
            ret, frame = cap.read()
            if not ret:
                break

            frames_processed += 1

            if frames_processed % frame_skip != 0:
                continue

            analyzed_frames += 1
            frame = cv2.resize(frame, (640, 480))
            results = yolo_model(frame, imgsz=640, verbose=False)
            boxes   = results[0].boxes

            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    cls_id   = int(box.cls[0])
                    det_conf = float(box.conf[0])
                    cls_name = yolo_model.names[cls_id]

                    # 🔍 Debug — shows exactly what the model detects each frame
                    print(f"   → Frame {analyzed_frames}: class_id={cls_id}, "
                          f"name='{cls_name}', conf={det_conf:.2f}")

                    # Skip low-confidence detections and "other" class
                    if det_conf < 0.3 or cls_name not in BEE_CLASS_NAMES | WASP_CLASS_NAMES:
                        print(f"      ⚠️  Skipped: low conf or unrecognized class '{cls_name}'")
                        continue

                    if cls_name in BEE_CLASS_NAMES:
                        bee_score += det_conf
                    elif cls_name in WASP_CLASS_NAMES:
                        wasp_score += det_conf

        cap.release()

        print(f"📊 bee_score={bee_score:.2f} | wasp_score={wasp_score:.2f}")
        print(f"🎞  Analyzed {analyzed_frames} / {frames_processed} frames")

        total_score = bee_score + wasp_score

        # ── Determine result ──
        if total_score == 0:
            # No bee or wasp detected at all — do NOT default to wasp
            predicted_class = "UNKNOWN"
            confidence      = 0.0
            hive_health     = "No bees or wasps detected — check model classes"
            print("⚠️  total_score=0 — model may not have bee/wasp classes. "
                  f"Check: {yolo_model.names}")

        elif bee_score >= wasp_score:
            predicted_class = "BEE"
            confidence      = round((bee_score / total_score) * 100, 2)
            hive_health     = "Healthy - Bees Active"

        else:
            predicted_class = "WASP"
            confidence      = round((wasp_score / total_score) * 100, 2)
            hive_health     = "Threat - Wasp Detected"

        print(f"✅ Final: {predicted_class} ({confidence}%)")

        return {
            "predicted_class":  predicted_class,
            "confidence":       confidence,
            "hive_health":      hive_health,
            "bee_score":        round(bee_score, 2),
            "wasp_score":       round(wasp_score, 2),
            "frames_analyzed":  analyzed_frames,
            "frames_processed": frames_processed,
        }

    except Exception as e:
        print(f"❌ Video error: {str(e)}")
        return {"error": f"Video processing failed: {str(e)}"}

    finally:
        os.unlink(tmp_path)


# ─────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Beehive AI backend running ✅"}