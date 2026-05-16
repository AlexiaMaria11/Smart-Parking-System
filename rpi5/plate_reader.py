"""
License plate detection for Raspberry Pi 5 + Logitech camera.

Uses EasyOCR (deep learning) instead of tesseract + contour detection.
EasyOCR handles blurry, real-world images far better because it detects
text regions and reads them in one neural-network pass — no clean edges needed.
"""

import re
import os
import cv2
import numpy as np
import easyocr

CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", "0"))

# Romanian plate pattern examples: BZ 99 AIN / B 123 ABC / CJ 01 XYZ
# Generalised: 1-2 letters, 2-3 digits, 2-3 letters (spaces optional)
_PLATE_RE = re.compile(r'^[A-Z]{1,2}\s?\d{2,3}\s?[A-Z]{2,3}$')

# Initialise once at import time (loads the model on first call)
_reader: easyocr.Reader | None = None


def _get_reader() -> easyocr.Reader:
    global _reader
    if _reader is None:
        print("Loading EasyOCR model (first run may take a moment)...")
        _reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    return _reader


# ---------------------------------------------------------------------------
# Camera helpers
# ---------------------------------------------------------------------------

def _open_camera(index: int) -> cv2.VideoCapture:
    cap = cv2.VideoCapture(index)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open camera at index {index}")
    # Higher resolution gives EasyOCR more pixels to work with
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    # Let the camera auto-adjust exposure and focus
    cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)
    return cap


def capture_frame(camera_index: int = CAMERA_INDEX) -> np.ndarray:
    cap = _open_camera(camera_index)
    # Discard warm-up frames so autofocus and exposure settle
    for _ in range(15):
        cap.read()
    ok, frame = cap.read()
    cap.release()
    if not ok or frame is None:
        raise RuntimeError("Failed to capture frame from camera")
    return frame


# ---------------------------------------------------------------------------
# Core detection
# ---------------------------------------------------------------------------

def _preprocess(frame: np.ndarray) -> np.ndarray:
    """Light sharpening to help EasyOCR on soft/blurry frames."""
    kernel = np.array([[0, -1, 0],
                       [-1, 5, -1],
                       [0, -1, 0]], dtype=np.float32)
    return cv2.filter2D(frame, -1, kernel)


# Characters that look alike — applied based on expected position type
_DIGIT_FIX  = str.maketrans("IOSTBGZ", "1051862")  # letter→digit: I→1, O→0, S→5, T→1, B→8, G→6, Z→2
_LETTER_FIX = str.maketrans("105862",  "IOSBGZ")   # digit→letter: 1→I, 0→O, 5→S, 8→B, 6→G, 2→Z

# Romanian plate structures as (letter_count, digit_count, letter_count)
# e.g. BZ 99 AIN = (2,2,3) | B 123 ABC = (1,3,3)
_PLATE_STRUCTURES = [
    (2, 2, 3),  # standard county: BZ 99 AIN
    (1, 2, 3),  # Bucharest short: B 12 ABC
    (1, 3, 3),  # Bucharest long:  B 123 ABC
    (2, 3, 3),  # other formats
]


def _correct_plate(raw: str) -> str:
    """
    Apply position-aware character correction based on known Romanian plate
    structures. Tries every known structure and returns the first that fits.
    """
    s = re.sub(r"[^A-Z0-9]", "", raw.upper())

    for l1, d, l2 in _PLATE_STRUCTURES:
        expected_len = l1 + d + l2
        if len(s) != expected_len:
            continue

        prefix  = s[:l1].translate(_LETTER_FIX)   # should be letters
        digits  = s[l1:l1+d].translate(_DIGIT_FIX) # should be digits
        suffix  = s[l1+d:].translate(_LETTER_FIX)  # should be letters

        # validate after correction
        if prefix.isalpha() and digits.isdigit() and suffix.isalpha():
            return prefix + digits + suffix

    # no structure matched — return cleaned as-is
    return s


def _score_text(text: str) -> tuple[str, int]:
    """
    Clean + correct a raw EasyOCR string and return (corrected, score).
    score: 2 = matches plate pattern, 1 = enough chars, 0 = noise
    """
    corrected = _correct_plate(text)
    normalised = re.sub(r"\s+", " ", text.upper().strip())

    if _PLATE_RE.match(normalised) or any(
        len(corrected) == l1+d+l2
        and corrected[:l1].isalpha()
        and corrected[l1:l1+d].isdigit()
        and corrected[l1+d:].isalpha()
        for l1, d, l2 in _PLATE_STRUCTURES
    ):
        return corrected, 2
    if len(corrected) >= 4:
        return corrected, 1
    return corrected, 0


def detect_plate(frame: np.ndarray) -> dict:
    sharpened = _preprocess(frame)
    reader = _get_reader()

    results = reader.readtext(
        sharpened,
        detail=1,
        paragraph=False,
        allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    )

    best_plate, best_conf, best_score = "", 0.0, 0
    all_results = []

    for (_bbox, text, conf) in results:
        cleaned, score = _score_text(text)
        all_results.append({"text": text, "cleaned": cleaned, "confidence": round(conf, 3)})

        if score == 0:
            continue
        # prefer pattern match (score=2) over raw length (score=1)
        if score > best_score or (score == best_score and conf > best_conf):
            best_plate, best_conf, best_score = cleaned, conf, score

    return {
        "plate": best_plate,
        "confidence": round(best_conf, 3),
        "found": len(best_plate) >= 4,
        "all": all_results,
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def read_plate_from_camera(camera_index: int = CAMERA_INDEX) -> str:
    """Capture one frame and return the plate string (empty if not found)."""
    frame = capture_frame(camera_index)
    return detect_plate(frame)["plate"]


def read_plate_from_image(image_path: str) -> str:
    """Load an image file and return the detected plate string."""
    frame = cv2.imread(image_path)
    if frame is None:
        raise FileNotFoundError(f"Image not found: {image_path}")
    return detect_plate(frame)["plate"]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys

    debug = "--debug" in sys.argv
    args = [a for a in sys.argv[1:] if a != "--debug"]

    if args:
        frame = cv2.imread(args[0])
        if frame is None:
            print(f"ERROR: could not load image: {args[0]}")
            sys.exit(1)
    else:
        print(f"Capturing from camera index {CAMERA_INDEX}...")
        frame = capture_frame()

    if debug:
        cv2.imwrite("debug_frame.jpg", frame)
        cv2.imwrite("debug_sharpened.jpg", _preprocess(frame))
        print("Saved: debug_frame.jpg, debug_sharpened.jpg")

    result = detect_plate(frame)

    print(f"Plate   : {result['plate'] or '(none detected)'}")
    print(f"Conf    : {result['confidence']:.2%}")
    print(f"Found   : {result['found']}")

    if debug and result["all"]:
        print("\nAll detected text regions:")
        for r in result["all"]:
            print(f"  '{r['text']}'  ->  '{r['cleaned']}'  conf={r['confidence']:.2%}")
