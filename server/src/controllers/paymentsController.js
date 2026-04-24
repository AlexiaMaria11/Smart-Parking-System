import { paymentsService } from "../services/paymentsService.js";
import { ok } from "../utils/response.js";

export const paymentsController = {
  list(req, res) {
    return ok(res, paymentsService.getPayments());
  }
};
