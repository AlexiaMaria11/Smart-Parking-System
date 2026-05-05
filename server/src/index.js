import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { registerParkingSocket } from "./sockets/parkingSocket.js";
import { startMqttService } from "./services/mqttService.js";

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrl
  }
});

registerParkingSocket(io);

if (env.mqttEnabled) {
  startMqttService(io);
} else {
  console.log("MQTT disabled by MQTT_ENABLED=false");
}

server.listen(env.port, () => {
  console.log(`Smart Parking API running on http://localhost:${env.port}`);
});
