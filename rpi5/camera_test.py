#!/usr/bin/env python3
import cv2

cam = cv2.VideoCapture("/dev/video0")

ret, frame = cam.read()
if ret:
    cv2.imwrite("test_capture.jpg", frame)
    print("Salvat: test_capture.jpg")
else:
    print("Eroare: nu s-a putut citi cadrul de la camera.")

cam.release()
