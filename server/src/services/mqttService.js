import mqtt from "mqtt";
import { env } from "../config/env.js";
import { handleBarrierTrigger, broadcastDisplayState } from "./barrierService.js";

let client = null;

export function startMqttService(io) {
  client = mqtt.connect(env.mqttBrokerUrl);

  client.on("connect", () => {
    console.log("MQTT connected to broker:", env.mqttBrokerUrl);
    client.subscribe("parking/bariera_intrare/trigger");
    client.subscribe("parking/bariera_iesire/trigger");
    broadcastDisplayState();
  });

  client.on("message", async (topic, message) => {
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
