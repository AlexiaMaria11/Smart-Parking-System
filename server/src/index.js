import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { registerParkingSocket } from "./sockets/parkingSocket.js";

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrl
  }
});

registerParkingSocket(io);

server.listen(env.port, () => {
  console.log(`Smart Parking API running on http://localhost:${env.port}`);
});
