import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL || "",
  mqttBrokerUrl: process.env.MQTT_BROKER_URL || "mqtt://localhost:1883"
};
