import { parkingEventsRepository } from "../repositories/parkingEventsRepository.js";

export const parkingEventsService = {
  getEvents() {
    return parkingEventsRepository.findAll();
  }
};
