#!/usr/bin/env python3
"""
Buton GPIO17 -> Camera -> OCR -> POST backend + update display local
"""

import os
import sys
import time
import re
import json
import cv2
import httpx
import paho.mqtt.client as mqtt
from gpiozero import Button

_here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _here)
sys.path.insert(0, os.path.join(_here, "tests"))

from post_processing import parse_and_validate_plate
import lcd_test as display

import onnxruntime  # noqa: F401
from rapidocr_onnxruntime import RapidOCR

BACKEND_URL  = "http://localhost:4000/api/anpr/detect"
MQTT_BROKER  = "localhost"
MQTT_PORT    = 1883
MQTT_TOPIC   = "parking/bariera_intrare/command"
MODELS_DIR   = os.path.join(_here, "models")
GPIO_BUTTON  = 17
MIN_CONF     = 0.5
SCAN_FRAMES  = 5

locuri_ramase = display.LOCURI_MAX

mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqtt_client.connect(MQTT_BROKER, MQTT_PORT)
mqtt_client.loop_start()

engine = RapidOCR(
    det_model_path=os.path.join(MODELS_DIR, "en_PP-OCRv3_det_infer.onnx"),
    rec_model_path=os.path.join(MODELS_DIR, "en_PP-OCRv3_rec_infer.onnx"),
)
button = Button(GPIO_BUTTON, pull_up=True)


def update_display(locuri: int):
    frame = display.build_frame(locuri)
    display.send_image(frame)
    print(f"[DISPLAY] Locuri ramase: {locuri}")


def scan_plate():
    cam = cv2.VideoCapture("/dev/video0")
    plate = None
    while True:
        ret, frame = cam.read()
        if not ret:
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        result, _ = engine(gray)
        if result is None:
            continue
        for (_, text, conf) in result:
            if conf is None or float(conf) < MIN_CONF:
                continue
            clean = re.sub(r'[^A-Z0-9]', '', text.upper())
            is_valid, detected_plate, _ = parse_and_validate_plate(clean)
            if is_valid:
                plate = detected_plate
                break
        if plate:
            break
    cam.release()
    return plate


def on_button_pressed():
    global locuri_ramase

    print("\n[BUTON] Apasare detectata — scanez...")
    plate = scan_plate()

    if plate is None:
        print("[SCAN] Niciun numar valid detectat.")
        return

    print(f"[SCAN] Numar detectat: {plate}")

    try:
        resp = httpx.post(BACKEND_URL, json={"plate": plate}, timeout=5)
        result = resp.json().get("data", {})
        if result.get("allowed"):
            print(f"[BACKEND] ACCES PERMIS — loc {result.get('spot')} ({result.get('type')})")
            mqtt_client.publish(MQTT_TOPIC, json.dumps({"action": "OPEN"}))
            print(f"[MQTT] Publicat pe {MQTT_TOPIC}: OPEN")
            if locuri_ramase > 0:
                locuri_ramase -= 1
                update_display(locuri_ramase)
        else:
            print(f"[BACKEND] ACCES REFUZAT — {result.get('reason', 'necunoscut')}")
            mqtt_client.publish(MQTT_TOPIC, json.dumps({"action": "DENY"}))
            print(f"[MQTT] Publicat pe {MQTT_TOPIC}: DENY")
    except Exception as e:
        print(f"[BACKEND] Eroare comunicare: {e}")


# ── Init display ──────────────────────────────────────────────────────────────
display.gpio_setup()
display.spi_setup()
display.init_gc9a01()
update_display(locuri_ramase)

print(f"Entry trigger activ | Buton pe GPIO{GPIO_BUTTON} | Ctrl+C pentru oprire\n")
button.when_pressed = on_button_pressed

try:
    while True:
        time.sleep(0.1)
except KeyboardInterrupt:
    print("\nOprire.")
finally:
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
    display.spi.close()
    if display._chip is not None:
        import lgpio
        lgpio.gpiochip_close(display._chip)
