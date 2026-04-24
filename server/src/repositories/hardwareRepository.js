import { mockHardware } from "../utils/mockData.js";

export const hardwareRepository = {
  findAll() {
    return mockHardware;
  }
};
