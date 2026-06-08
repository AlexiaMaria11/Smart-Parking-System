import paho.mqtt.client as mqtt
import time

BROKER_IP = "localhost"
BROKER_PORT = 1883

TOPIC_CMD = "parking/arduino/cmd"
TOPIC_STATUS = "parking/arduino/status"
TOPIC_SENSORS = "parking/arduino/sensors"


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
        client.subscribe(TOPIC_STATUS)
        client.subscribe(TOPIC_SENSORS)
    else:
        print("Connection failed:", rc)


def on_message(client, userdata, msg):
    print(f"[{msg.topic}] {msg.payload.decode()}")


client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER_IP, BROKER_PORT, 60)
client.loop_start()

time.sleep(1)

while True:
    print("\n1 - Open entry gate")
    print("2 - Close entry gate")
    print("3 - Get status")
    print("q - Quit")

    choice = input("> ")

    if choice == "1":
        client.publish(TOPIC_CMD, "OPEN_ENTRY")

    elif choice == "2":
        client.publish(TOPIC_CMD, "CLOSE_ENTRY")

    elif choice == "3":
        client.publish(TOPIC_CMD, "GET_STATUS")

    elif choice == "q":
        break

client.loop_stop()
client.disconnect()