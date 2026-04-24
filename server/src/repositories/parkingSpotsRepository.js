import { mockParkingSpots } from "../utils/mockData.js";

export const parkingSpotsRepository = {
  findAll() {
    return mockParkingSpots;
  }
};
