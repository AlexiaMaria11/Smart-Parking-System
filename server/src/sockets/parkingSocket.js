export function registerParkingSocket(io) {
  io.on("connection", (socket) => {
    socket.emit("parking:bootstrap", {
      availableSpots: 42,
      occupiedSpots: 78
    });

    socket.on("parking:spot:update", (payload) => {
      io.emit("parking:spot:updated", payload);
    });
  });
}
