export const hardwareRepository = {
  findAll() {
    return [
      { id: "d1", name: "North Gate Barrier", type: "BARRIER", status: "ONLINE", uptime: 99.8 },
      { id: "d2", name: "Entry Camera", type: "CAMERA", status: "ONLINE", uptime: 98.9 }
    ];
  }
};
