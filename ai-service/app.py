from fastapi import FastAPI

app = FastAPI(title="Smart Parking OCR Placeholder")


def capture_frame():
    return {"status": "captured", "source": "camera-stream-placeholder"}


def detect_plate(frame):
    return {"status": "detected", "bbox": [120, 80, 320, 160], "frame": frame}


def extract_ocr_text(detection):
    return {"status": "parsed", "license_plate": "B-92-UNI", "confidence": 0.93, "input": detection}


def send_detected_plate_to_backend(plate_payload):
    return {
        "status": "queued",
        "target": "http://localhost:4000/api/parking-events",
        "payload": plate_payload,
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ocr/process")
def process_plate():
    frame = capture_frame()
    detection = detect_plate(frame)
    ocr_result = extract_ocr_text(detection)
    backend_response = send_detected_plate_to_backend(ocr_result)

    return {
        "capture": frame,
        "detection": detection,
        "ocr": ocr_result,
        "backend": backend_response,
    }
