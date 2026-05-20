import { notificationsRepository } from "../repositories/notificationsRepository.js";

export const notificationsService = {
  getNotificationsByUser(userId) {
    return notificationsRepository.findAllByUser(userId);
  }
};
