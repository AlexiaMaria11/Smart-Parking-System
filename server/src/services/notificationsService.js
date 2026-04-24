import { notificationsRepository } from "../repositories/notificationsRepository.js";

export const notificationsService = {
  getNotificationsByUser(userId = "u2") {
    return notificationsRepository.findAllByUser(userId);
  }
};
