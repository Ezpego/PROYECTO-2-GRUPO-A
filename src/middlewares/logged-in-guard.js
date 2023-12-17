import { throwUnauthorizedError } from "../utils/errors.js";

export function loggedInGuard(req, res, next) {
  try {
    if (!req.currentUser) {
      throwUnauthorizedError();
    }
    next();
  } catch (err) {
    next(err);
  }
}
