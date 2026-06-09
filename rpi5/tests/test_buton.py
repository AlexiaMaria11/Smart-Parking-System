from gpiozero import Button
from time import sleep

pin = Button(17, pull_up=True)
pin2 = Button(27, pull_up=True)
while True:
    print("APASAT1" if pin.is_active else "liber")
    #print("APASAT2" if pin2.is_active else "liber")
    sleep(0.2)
