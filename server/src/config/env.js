import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "smart-parking-secret-key-2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  mqttEnabled: process.env.MQTT_ENABLED?.toLowerCase() !== "false",
  mqttBrokerUrl: process.env.MQTT_BROKER_URL || "mqtt://localhost:1883"
};
