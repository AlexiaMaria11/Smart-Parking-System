import { usersService } from "../services/usersService.js";
import { ok } from "../utils/response.js";

export const usersController = {
  list(req, res) {
    return ok(res, usersService.getUsers());
  }
};
