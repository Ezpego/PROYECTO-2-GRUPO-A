export function throwUnauthorizedError() {
    throw {
      httpStatus: 401,
      error: "UNAUTHORIZED",
    };
  }