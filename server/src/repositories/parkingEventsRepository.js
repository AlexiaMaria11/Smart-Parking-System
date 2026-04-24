import { mockParkingEvents } from "../utils/mockData.js";

export const parkingEventsRepository = {
  findAll() {
    return mockParkingEvents;
  }
};
