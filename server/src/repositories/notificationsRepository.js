import { mockNotifications } from "../utils/mockData.js";

export const notificationsRepository = {
  findAllByUser(userId) {
    return mockNotifications.filter((notification) => notification.userId === userId);
  }
};
