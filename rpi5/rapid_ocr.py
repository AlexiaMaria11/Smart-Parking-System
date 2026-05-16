#!/usr/bin/env python3
"""
L4 - ANPR cu EasyOCR pe Raspberry Pi 4B
Camera clasica RPi (CSI) + EasyOCR local + validare numere RO din L1
"""

import sys
import os
import time
import re
import cv2
import numpy as np

# ORT scrie warninguri de GPU direct pe fd 2 (C++), inainte ca Python sa ruleze.
# Redirectam fd-ul la nivel OS pe durata importului.
_devnull = os.open(os.devnull, os.O_WRONLY)
_stderr  = os.dup(2)
os.dup2(_devnull, 2)
os.close(_devnull)
import onnxruntime as ort
from rapidocr_onnxruntime import RapidOCR
os.dup2(_stderr, 2)
os.close(_stderr)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'L1'))
from post_processing import parse_and_validate_plate

# ─── Configurare ──────────────────────────────────────────────────────────────
RESOLUTION       = (1280, 720)
CAPTURE_INTERVAL = 2.0        # secunde intre capturi
MIN_CONFIDENCE   = 0.25       # prag minim EasyOCR
DEBUG_DIR        = os.path.join(os.path.dirname(__file__), "debug")
SAVE_DEBUG       = True       # salveaza imagine pentru fiecare detectie valida


# ─── Initializare ─────────────────────────────────────────────────────────────
def init_camera():
    cam = cv2.VideoCapture("/dev/video0")  # 0 = primul USB camera
    cam.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    time.sleep(1)
    print("Camera pornita.")
    return cam


def init_ocr():
    print("Initializare RapidOCR cu modele engleze...")
    models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
    engine = RapidOCR(
        det_model_path=os.path.join(models_dir, "en_PP-OCRv3_det_infer.onnx"),
        rec_model_path=os.path.join(models_dir, "en_PP-OCRv3_rec_infer.onnx"),
    )
    print("RapidOCR gata.")
    return engine


# ─── Procesare imagine ────────────────────────────────────────────────────────
def preprocess(frame_rgb):
    """Grayscale + contrast adaptiv + filtru bilateral (L2/L3)."""
    gray  = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray  = clahe.apply(gray)
    gray  = cv2.bilateralFilter(gray, 11, 17, 17)
    return gray


def find_plate_roi(gray):
    """
    Detectie contururi dreptunghiulare (metoda L2/L3).
    Returneaza crop-ul placutei sau None daca nu gaseste.
    """
    edged = cv2.Canny(gray, 30, 200)
    cnts, _ = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)[:10]

    for c in cnts:
        peri   = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.018 * peri, True)
        if len(approx) != 4:
            continue

        mask = np.zeros(gray.shape, np.uint8)
        cv2.drawContours(mask, [approx], 0, 255, -1)
        xs, ys = np.where(mask == 255)
        if len(xs) == 0:
            continue

        cropped = gray[xs.min():xs.max() + 1, ys.min():ys.max() + 1]
        h, w = cropped.shape
        # Proportii tipice placuta: latime/inaltime intre 2 si 10
        if w > 80 and h > 20 and 2.0 < w / h < 10.0:
            return cropped

    return None


def extract_candidates(ocr_results):
    """Filtreaza rezultatele EasyOCR la lungimi compatibile cu placute RO."""
    candidates = []
    for (_, text, confidence) in ocr_results:
        if confidence is None or float(confidence) < MIN_CONFIDENCE:
            continue
        clean = re.sub(r'[^A-Z0-9]', '', text.upper())
        if 5 <= len(clean) <= 9:
            candidates.append((clean, round(float(confidence), 2)))
    return candidates


# ─── Loop principal ───────────────────────────────────────────────────────────
def run():
    if SAVE_DEBUG:
        os.makedirs(DEBUG_DIR, exist_ok=True)

    cam    = init_camera()
    engine = init_ocr()

    print("\n=== ANPR activ | Ctrl+C pentru oprire ===\n")

    try:
        while True:
            ret, frame = cam.read()
            if not ret:
                continue
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            gray  = preprocess(frame)

            # Incearca detectia pe ROI (mai rapid); fallback pe imaginea intreaga
            roi    = find_plate_roi(gray)
            target = roi if roi is not None else gray

            ocr_result, _ = engine(target)
            results    = ocr_result if ocr_result is not None else []
            candidates = extract_candidates(results)

            if not candidates:
                time.sleep(CAPTURE_INTERVAL)
                continue

            for raw, conf in candidates:
                is_valid, plate, plate_type = parse_and_validate_plate(raw)
                ts = time.strftime('%H:%M:%S')

                if is_valid:
                    print(f"[{ts}] VALID   {plate}  ({plate_type})  |  conf OCR: {conf}")
                    if SAVE_DEBUG:
                        fname    = f"{int(time.time())}_{plate.replace(' ', '_')}.jpg"
                        out_path = os.path.join(DEBUG_DIR, fname)
                        cv2.imwrite(out_path, cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
                else:
                    print(f"[{ts}] INVALID '{raw}'  —  {plate_type}")

            time.sleep(CAPTURE_INTERVAL)

    except KeyboardInterrupt:
        print("\nOprire ANPR.")
    finally:
        cam.release()


if __name__ == "__main__":
    run()