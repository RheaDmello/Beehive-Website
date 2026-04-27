import numpy as np
import librosa
import librosa.display
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from PIL import Image
import io
import os

MODEL_PATH = '/Users/rhea.dmello/Desktop/Code/Beehive Project/backend/queenbee_final_model.h5'
AUDIO_FILE_PATH = "/Users/rhea.dmello/Desktop/Code/Beehive Project/backend/Queeen.mp3"

if not os.path.exists(MODEL_PATH):
 raise FileNotFoundError(f"Model not found at: {MODEL_PATH}")
if not os.path.exists(AUDIO_FILE_PATH):
 raise FileNotFoundError(f"Audio file not found: {AUDIO_FILE_PATH}")

model = load_model(MODEL_PATH)
print("✅ Model loaded. Input shape:", model.input_shape)

# ✅ Must match training exactly
IMG_SIZE = (128, 128)
SR = 22050
DURATION = 3

def audio_to_spectrogram_image(audio_path):
 # ✅ Step 1: Load
 y, sr = librosa.load(audio_path, sr=SR)

 # ✅ Step 2: Trim silence — same as training
 y, _ = librosa.effects.trim(y)

 # ✅ Step 3: Convert to mono — same as training
 y = librosa.to_mono(y) if y.ndim > 1 else y

 # ✅ Step 4: Normalize — same as training
 y = librosa.util.normalize(y)

 # ✅ Step 5: Fixed duration (3 seconds) — same as training
 max_len = SR * DURATION
 if len(y) > max_len:
    y = y[:max_len]
 else:
    y = np.pad(y, (0, max_len - len(y)))

 # ✅ Step 6: Mel spectrogram
 S = librosa.feature.melspectrogram(y=y, sr=SR, n_mels=128)
 S_dB = librosa.power_to_db(S, ref=np.max)

 # ✅ Step 7: Save as magma PNG in memory — same as training
 fig = plt.figure(figsize=(2.56, 2.56), dpi=100)
 librosa.display.specshow(S_dB, sr=SR, cmap='magma')
 plt.axis('off')
 plt.tight_layout(pad=0)
 buf = io.BytesIO()
 plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
 plt.close(fig)
 buf.seek(0)

 # ✅ Step 8: Load, resize, normalize to 0-1
 img = Image.open(buf).convert('RGB').resize(IMG_SIZE)
 img_array = np.array(img) / 255.0
 return np.expand_dims(img_array, axis=0) # (1, 128, 128, 3)

# --- PREDICTION ---
print(f"\n🎧 Loading audio: {os.path.basename(AUDIO_FILE_PATH)}")
features = audio_to_spectrogram_image(AUDIO_FILE_PATH)

prediction = model.predict(features, verbose=0)
queen_prob = float(prediction[0][0])

print(f"\n🔍 Raw prediction value: {queen_prob:.6f}")

# Class indices from training: absent=0, present=1 (alphabetical)
if queen_prob >= 0.5:
 predicted_class = "QUEEN BEE PRESENT"
 confidence = queen_prob * 100
else:
 predicted_class = "NO QUEEN BEE"
 confidence = (1 - queen_prob) * 100

print(f"\n✅ Predicted Class : {predicted_class}")
print(f"📊 Confidence : {confidence:.2f}%")
print(f"\n Queen Present Prob : {queen_prob:.4f}")
print(f" Queen Absent Prob : {1 - queen_prob:.4f}")