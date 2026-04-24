import { hardwareRepository } from "../repositories/hardwareRepository.js";

export const hardwareService = {
  getDevices() {
    return hardwareRepository.findAll();
  }
};
