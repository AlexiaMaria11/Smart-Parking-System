#!/usr/bin/env python3

"""
Raspberry Pi parking control script

Entry flow:
GPIO17 -> entry camera -> OCR -> backend validation -> MQTT open entry -> wait Arduino status -> update display

Exit flow:
GPIO27 -> exit camera -> OCR -> backend validation/payment check -> MQTT open exit or buzzer/deny -> wait Arduino status -> update display
"""

import os
import sys
import time
import re
import json
import threading
from typing import Optional, Dict, Any

import cv2
import httpx
import paho.mqtt.client as mqtt
from gpiozero import Button, Buzzer

_here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _here)
sys.path.insert(0, os.path.join(_here, "tests"))

from post_processing import parse_and_validate_plate
import tests.lcd_test as display

import onnxruntime  # noqa: F401
from rapidocr_onnxruntime import RapidOCR


# ── Config ───────────────────────────────────────────────────────────────────

BACKEND_URL = "http://localhost:4000/api/anpr/detect"

MQTT_BROKER = "localhost"
MQTT_PORT = 1883

MQTT_TOPIC_ENTRY = "parking/rpi/open_entry"
MQTT_TOPIC_EXIT = "parking/rpi/open_exit"
MQTT_TOPIC_ARDUINO_STATUS = "parking/arduino/status"

GPIO_BUTTON_ENTRY = 17
GPIO_BUTTON_EXIT = 27
GPIO_BUZZER = 26

ENTRY_CAMERA_PATH = "/dev/video2"
EXIT_CAMERA_PATH = "/dev/video0"

MODELS_DIR = os.path.join(_here, "models")

MIN_CONF = 0.5
SCAN_FRAMES = 80
SCAN_TIMEOUT_SECONDS = 8

STATUS_TIMEOUT_SECONDS = 5

PARKING_ID_ARDUINO = {
    "A1": 1,
    "A2": 2,
    "A3": 3,
    "B1": 4,
    "B2": 5,
    "B3": 6,
}


# ── Global state ──────────────────────────────────────────────────────────────

latest_parking_status: Optional[str] = None
latest_status_time: float = 0.0

status_condition = threading.Condition()
process_lock = threading.Lock()
display_lock = threading.Lock()   # protects all SPI/display writes across threads

mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
buzzer = Buzzer(GPIO_BUZZER)


# ── OCR engine ────────────────────────────────────────────────────────────────

engine = RapidOCR(
    det_model_path=os.path.join(MODELS_DIR, "en_PP-OCRv3_det_infer.onnx"),
    rec_model_path=os.path.join(MODELS_DIR, "en_PP-OCRv3_rec_infer.onnx"),
)


# ── Display helpers ──────────────────────────────────────────────────────────

def update_display(locuri: int) -> None:
    """
    Updates the display with the number of free parking spots.
    Uses your existing lcd_test.py display functions.
    """
    with display_lock:
        try:
            frame = display.build_frame(locuri)
            display.send_image(frame)
            print(f"[DISPLAY] Locuri ramase: {locuri}")
        except Exception as e:
            print(f"[DISPLAY] Eroare update_display: {e}")


def display_message(message: str) -> None:
    """
    Shows a general text message on the display.

    If your display module has a custom text-frame function, use it.
    Otherwise, this falls back to console print.
    """
    print(f"[DISPLAY MESSAGE] {message}")

    with display_lock:
        try:
            if hasattr(display, "build_text_frame"):
                frame = display.build_text_frame(message)
                display.send_image(frame)
            elif hasattr(display, "show_message"):
                display.show_message(message)
            else:
                # Fallback: no text rendering function available in lcd_test.py
                # The message is still printed in terminal.
                pass
        except Exception as e:
            print(f"[DISPLAY] Eroare display_message: {e}")


def display_error(message: str) -> None:
    """
    Shows an error message on the display.
    """
    print(f"[DISPLAY ERROR] {message}")

    with display_lock:
        try:
            if hasattr(display, "build_error_frame"):
                frame = display.build_error_frame(message)
                display.send_image(frame)
            elif hasattr(display, "show_error"):
                display.show_error(message)
            else:
                # display_message would deadlock here (it also acquires display_lock)
                print(f"[DISPLAY] ERROR: {message}")
        except Exception as e:
            print(f"[DISPLAY] Eroare display_error: {e}")


def is_valid_status(status: str) -> bool:
    """
    Arduino status must be exactly 3 chars, only 0 or 1.
    Example: 101
    """
    return bool(re.fullmatch(r"[01]{3}", status))


def count_free_spots(status: str) -> int:
    """
    Counts free spots from Arduino status.
    0 = free, 1 = occupied.
    """
    if not is_valid_status(status):
        raise ValueError(f"Invalid parking status: {status}")

    return status.count("0")


def display_free_spots_from_status(status: str) -> None:
    """
    Converts Arduino status string to number of free spots and updates display.
    """
    try:
        free_spots = count_free_spots(status)
        update_display(free_spots)
    except Exception as e:
        print(f"[DISPLAY] Nu pot actualiza locurile din status '{status}': {e}")


# ── MQTT helpers ─────────────────────────────────────────────────────────────

def on_mqtt_connect(client, userdata, flags, reason_code, properties=None):
    print(f"[MQTT] Connected with reason code: {reason_code}")
    client.subscribe(MQTT_TOPIC_ARDUINO_STATUS)
    print(f"[MQTT] Subscribed to {MQTT_TOPIC_ARDUINO_STATUS}")


def on_mqtt_message(client, userdata, msg):
    """
    Receives Arduino parking status.
    Expected payload: string of 3 digits, e.g. 101
    """
    global latest_parking_status, latest_status_time

    try:
        payload = msg.payload.decode("utf-8").strip()
    except Exception as e:
        print(f"[MQTT] Payload decode error: {e}")
        return

    print(f"[MQTT] Received on {msg.topic}: {payload}")

    if msg.topic == MQTT_TOPIC_ARDUINO_STATUS:
        if not is_valid_status(payload):
            print(f"[MQTT] Invalid Arduino status ignored: {payload}")
            return

        with status_condition:
            latest_parking_status = payload
            latest_status_time = time.time()
            status_condition.notify_all()

        display_free_spots_from_status(payload)


def publish_entry_open(arduino_spot_id: Optional[int] = None) -> None:
    """
    Opens entry barrier.
    If arduino_spot_id is provided, this means the user has a reservation.
    """
    if arduino_spot_id is not None:
        message = f"open {arduino_spot_id}"
    else:
        message = "open"

    mqtt_client.publish(MQTT_TOPIC_ENTRY, message)
    print(f"[MQTT] Published to {MQTT_TOPIC_ENTRY}: {message}")


def publish_exit_open() -> None:
    """
    Opens exit barrier.
    """
    mqtt_client.publish(MQTT_TOPIC_EXIT, "open")
    print(f"[MQTT] Published to {MQTT_TOPIC_EXIT}: open")


def publish_exit_deny(reason: str = "payment_required") -> None:
    """
    Sends a deny command on exit topic.
    Use this if your Arduino handles buzzer from MQTT.
    """
    mqtt_client.publish(MQTT_TOPIC_EXIT, "deny")
    print(f"[MQTT] Published to {MQTT_TOPIC_EXIT}: deny ({reason})")


def wait_for_parking_status(timeout: int = STATUS_TIMEOUT_SECONDS) -> Optional[str]:
    """
    Waits for a fresh Arduino parking status after opening a barrier.
    """
    start_time = time.time()

    with status_condition:
        current_known_time = latest_status_time

        while time.time() - start_time < timeout:
            remaining = timeout - (time.time() - start_time)
            status_condition.wait(timeout=remaining)

            if latest_parking_status is not None and latest_status_time > current_known_time:
                print(f"[MQTT] Fresh parking status received: {latest_parking_status}")
                return latest_parking_status

    print("[MQTT] Timeout waiting for fresh Arduino status")
    return None


# ── Backend helpers ──────────────────────────────────────────────────────────

def post_plate_to_backend(plate: str, direction: str) -> Dict[str, Any]:
    """
    Sends plate to backend.

    direction should be:
    - "entry"
    - "exit"

    The backend is expected to return:
    {
        "data": {
            ...
        }
    }

    If your backend does not use direction yet, it can simply ignore this field.
    """
    payload = {
        "plate": plate,
        "direction": direction,
    }

    response = httpx.post(BACKEND_URL, json=payload, timeout=5)
    response.raise_for_status()

    body = response.json()
    return body.get("data", {})


def get_entry_access_info(plate: str) -> Dict[str, Any]:
    """
    Returns clean entry access dictionary.

    Expected backend data format:
    {
        "plate_found": True,
        "entry_allowed": True,
        "entry_type": "RESERVATION",   # "RESERVATION" | "WALK_IN" | "CONFLICT" | None
        "spot_code": "A2",
        "original_spot_code": None,
        "reason": None
    }
    """
    try:
        data = post_plate_to_backend(plate, "entry")

        # Backend returns: { allowed, type, spot, originalSpot, reason }
        return {
            "plate_found": True,
            "entry_allowed": bool(data.get("allowed", False)),
            "entry_type": data.get("type"),
            "spot_code": data.get("spot"),
            "original_spot_code": data.get("originalSpot"),
            "reason": data.get("reason"),
        }

    except Exception as e:
        print(f"[BACKEND] Entry error: {e}")

        return {
            "plate_found": False,
            "entry_allowed": False,
            "entry_type": None,
            "spot_code": None,
            "original_spot_code": None,
            "reason": "backend_error",
        }


def get_exit_access_info(plate: str) -> Dict[str, Any]:
    """
    Returns clean exit access dictionary.

    Expected backend data format:
    {
        "plate_found": True,
        "exit_allowed": True,
        "paid": True,
        "spot_code": "B4",
        "reason": None
    }
    """
    try:
        data = post_plate_to_backend(plate, "exit")

        # Backend returns: { exit_allowed, paid, spot_code, reason }
        return {
            "plate_found": data.get("reason") != "no_plate",
            "exit_allowed": bool(data.get("exit_allowed", False)),
            "paid": data.get("paid"),
            "spot_code": data.get("spot_code"),
            "reason": data.get("reason"),
        }

    except Exception as e:
        print(f"[BACKEND] Exit error: {e}")

        return {
            "plate_found": False,
            "exit_allowed": False,
            "paid": None,
            "spot_code": None,
            "reason": "backend_error",
        }


# ── Camera / OCR ─────────────────────────────────────────────────────────────

def scan_plate(camera_path: str) -> Optional[str]:
    """
    Opens the given camera path, scans frames, runs OCR, validates plate,
    and returns the first valid plate found.

    Returns None if:
    - camera cannot be opened
    - no valid plate is found before timeout/frame limit
    """
    print(f"[CAMERA] Opening camera: {camera_path}")

    cam = cv2.VideoCapture(camera_path)

    if not cam.isOpened():
        print(f"[CAMERA] Cannot open camera: {camera_path}")
        display_error("Camera error")
        return None

    plate: Optional[str] = None
    frame_count = 0
    start_time = time.time()

    try:
        while frame_count < SCAN_FRAMES and time.time() - start_time < SCAN_TIMEOUT_SECONDS:
            ret, frame = cam.read()
            frame_count += 1

            if not ret or frame is None:
                print("[CAMERA] Failed to read frame")
                time.sleep(0.05)
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            result, _ = engine(gray)

            if result is None:
                continue

            for item in result:
                try:
                    _, text, conf = item
                except ValueError:
                    continue

                if conf is None or float(conf) < MIN_CONF:
                    continue

                clean = re.sub(r"[^A-Z0-9]", "", text.upper())

                is_valid, detected_plate, _ = parse_and_validate_plate(clean)

                if is_valid:
                    plate = detected_plate
                    print(f"[OCR] Valid plate detected: {plate}")
                    break

            if plate:
                break

    finally:
        cam.release()
        print(f"[CAMERA] Released camera: {camera_path}")

    if plate is None:
        print("[OCR] No valid plate detected")
    else:
        plate = plate.replace(" ", "-")

    return plate


# ── Flow helpers ─────────────────────────────────────────────────────────────

def handle_status_after_barrier_open() -> None:
    """
    Waits for Arduino status after a barrier action and updates display.
    If no fresh status arrives, keeps current display state.
    """
    status = wait_for_parking_status(timeout=STATUS_TIMEOUT_SECONDS)

    if status is not None:
        display_free_spots_from_status(status)
    else:
        display_error("No parking status")


def on_entry_button_pressed() -> None:
    """
    Entry button flow:
    scan plate -> validate backend -> open entry barrier -> wait status -> update display.
    """
    if not process_lock.acquire(blocking=False):
        print("[SYSTEM] Busy. Entry ignored.")
        display_message("System busy")
        return

    try:
        print("\n[ENTRY] Button pressed")
        display_message("Scanning entry...")

        plate = scan_plate(ENTRY_CAMERA_PATH)

        if plate is None:
            display_error("Invalid plate")
            return

        print(f"[ENTRY] Plate: {plate}")
        display_message(f"Plate: {plate}")

        info = get_entry_access_info(plate)
        print(f"[ENTRY] Backend info: {info}")

        if not info["plate_found"]:
            display_message("Please authenticate in app")
            return

        if not info["entry_allowed"]:
            reason = info.get("reason") or "entry_denied"
            display_error(reason)
            return

        entry_type = info.get("entry_type")
        spot_code = info.get("spot_code")

        if entry_type == "RESERVATION":
            if not spot_code:
                display_error("Missing spot")
                return

            arduino_spot_id = PARKING_ID_ARDUINO.get(spot_code)

            if arduino_spot_id is None:
                display_error("Invalid spot")
                print(f"[ENTRY] Spot code not mapped to Arduino: {spot_code}")
                return

            display_message(f"Reserved spot {spot_code}")
            publish_entry_open(arduino_spot_id=arduino_spot_id)

        elif entry_type == "WALK_IN":
            display_message("Entry allowed")
            publish_entry_open()

        elif entry_type == "CONFLICT":
            reason = info.get("reason") or "conflict"
            original_spot = info.get("original_spot_code")
            new_spot = info.get("spot_code")

            print(f"[ENTRY] Conflict. Original spot: {original_spot}, assigned spot: {new_spot}")

            if not new_spot:
                display_error(reason)
                return

            arduino_spot_id = PARKING_ID_ARDUINO.get(new_spot)

            if arduino_spot_id is None:
                display_error("Invalid spot")
                print(f"[ENTRY] Conflict spot not mapped to Arduino: {new_spot}")
                return

            display_message(f"Assigned spot {new_spot}")
            publish_entry_open(arduino_spot_id=arduino_spot_id)

        else:
            # If backend allows entry but does not specify type,
            # open as a normal non-reservation entry.
            display_message("Entry allowed")
            publish_entry_open()

        handle_status_after_barrier_open()

    except Exception as e:
        print(f"[ENTRY] Unexpected error: {e}")
        display_error("Entry error")

    finally:
        process_lock.release()


def on_exit_button_pressed() -> None:
    """
    Exit button flow:
    scan plate -> check payment/backend -> open exit barrier or deny -> wait status -> update display.
    """
    if not process_lock.acquire(blocking=False):
        print("[SYSTEM] Busy. Exit ignored.")
        display_message("System busy")
        return

    try:
        print("\n[EXIT] Button pressed")
        display_message("Scanning exit...")

        plate = scan_plate(EXIT_CAMERA_PATH)

        if plate is None:
            display_error("Invalid plate")
            return

        print(f"[EXIT] Plate: {plate}")
        display_message(f"Plate: {plate}")

        info = get_exit_access_info(plate)
        print(f"[EXIT] Backend info: {info}")

        if not info["plate_found"]:
            display_message("Plate not found")
            return

        if info.get("paid") is not True:
            display_error("Payment required")
            publish_exit_deny(reason="unpaid")
            buzzer.beep(on_time=0.2, off_time=0.1, n=3)
            return

        if not info["exit_allowed"]:
            reason = info.get("reason") or "exit_denied"
            display_error(reason)
            publish_exit_deny(reason=reason)
            return

        spot_code = info.get("spot_code")
        if spot_code:
            display_message(f"Exit from {spot_code}")
        else:
            display_message("Exit allowed")

        publish_exit_open()
        handle_status_after_barrier_open()

    except Exception as e:
        print(f"[EXIT] Unexpected error: {e}")
        display_error("Exit error")

    finally:
        process_lock.release()


# ── Init / cleanup ───────────────────────────────────────────────────────────

def init_display() -> None:
    display.gpio_setup()
    display.spi_setup()
    display.init_gc9a01()

    if latest_parking_status is not None:
        display_free_spots_from_status(latest_parking_status)
    else:
        update_display(display.LOCURI_MAX)


def init_mqtt() -> None:
    mqtt_client.on_connect = on_mqtt_connect
    mqtt_client.on_message = on_mqtt_message

    mqtt_client.connect(MQTT_BROKER, MQTT_PORT)
    mqtt_client.loop_start()


def cleanup() -> None:
    print("[SYSTEM] Cleaning up...")

    try:
        mqtt_client.loop_stop()
        mqtt_client.disconnect()
    except Exception as e:
        print(f"[MQTT] Cleanup error: {e}")

    try:
        if hasattr(display, "spi") and display.spi is not None:
            display.spi.close()
    except Exception as e:
        print(f"[DISPLAY] SPI cleanup error: {e}")

    try:
        if getattr(display, "_chip", None) is not None:
            import lgpio
            lgpio.gpiochip_close(display._chip)
    except Exception as e:
        print(f"[DISPLAY] GPIO cleanup error: {e}")


def main() -> None:
    init_display()
    init_mqtt()

    entry_button = Button(GPIO_BUTTON_ENTRY, pull_up=True, bounce_time=0.5)
    exit_button = Button(GPIO_BUTTON_EXIT, pull_up=True, bounce_time=0.5)

    entry_button.when_pressed = on_entry_button_pressed
    exit_button.when_pressed = on_exit_button_pressed

    print("\nParking control active")
    print(f"Entry button: GPIO{GPIO_BUTTON_ENTRY}, camera: {ENTRY_CAMERA_PATH}")
    print(f"Exit button: GPIO{GPIO_BUTTON_EXIT}, camera: {EXIT_CAMERA_PATH}")
    print("Press Ctrl+C to stop.\n")

    try:
        while True:
            time.sleep(0.1)

    except KeyboardInterrupt:
        print("\n[SYSTEM] Stopping...")

    finally:
        cleanup()


if __name__ == "__main__":
    main()