from gpiozero import Button
from time import sleep

pin = Button(17, pull_up=True)
while True:
    print("APASAT" if pin.is_active else "liber")
    sleep(0.2)
