import mqtt from "mqtt";
import { env } from "../config/env.js";
import { prisma } from "../config/db.js";
import { handleBarrierTrigger, broadcastDisplayState } from "./barrierService.js";
import { getFormattedSpot } from "../utils/spotFormatter.js";

// Maps Arduino status string position to parking spot code
// status[0] = B1, status[1] = B2, status[2] = B3
const ARDUINO_STATUS_MAP = ["B1", "B2", "B3"];

let client = null;

async function handleArduinoStatus(statusString, io) {
  if (!/^[01]{3}$/.test(statusString)) {
    console.warn("MQTT: invalid Arduino status ignored:", statusString);
    return;
  }

  for (let i = 0; i < ARDUINO_STATUS_MAP.length; i++) {
    const code = ARDUINO_STATUS_MAP[i];
    const isAvailable = statusString[i] === "0";

    const spot = await prisma.parkingSpot.findUnique({ where: { code } });
    if (!spot) continue;

    if (spot.isAvailable !== isAvailable) {
      await prisma.parkingSpot.update({
        where: { code },
        data: { isAvailable },
      });

      if (io) {
        const updated = await getFormattedSpot(spot.id);
        if (updated) io.emit("parking:spot:updated", updated);
      }

      console.log(`MQTT: ${code} → ${isAvailable ? "free" : "occupied"}`);
    }
  }
}

export function startMqttService(io) {
  client = mqtt.connect(env.mqttBrokerUrl);

  client.on("connect", () => {
    console.log("MQTT connected to broker:", env.mqttBrokerUrl);
    client.subscribe("parking/bariera_intrare/trigger");
    client.subscribe("parking/bariera_iesire/trigger");
    client.subscribe("parking/arduino/status");
    broadcastDisplayState();
  });

  client.on("message", async (topic, message) => {
    if (topic === "parking/arduino/status") {
      await handleArduinoStatus(message.toString().trim(), io);
      return;
    }

    const payload = JSON.parse(message.toString());
    const barrierId = topic.split("/")[1];
    await handleBarrierTrigger({ barrierId, payload, io, mqttClient: client });
  });

  client.on("error", (err) => {
    console.error("MQTT error:", err.message);
  });
}

export function publishCommand(barrierId, action) {
  if (!client) return;
  const topic = `parking/${barrierId}/command`;
  client.publish(topic, JSON.stringify({ action }));
}

export function publishDisplayUpdate({ freeSpots, pricePerHour }) {
  if (!client) return;
  client.publish(
    "parking/display",
    JSON.stringify({ freeSpots, pricePerHour }),
    { retain: true }
  );
}
