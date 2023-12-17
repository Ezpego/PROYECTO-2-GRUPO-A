
// --------------------------
// ERRORES COMUNES
// --------------------------
export function throwUnauthorizedError() {
  throw {
      httpStatus: 401,
      error: "UNAUTHORIZED",
      message: "UNAUTHORIZED",
  };
}


export function throwErrorUserNotFound() {
  throw {
      httpStatus: 404,
      error: "User not found",
      message: "User not found",
  };
}

export function throwErrorAllFieldsRequired() {
  throw {
      httpStatus: 400,
      error: "All fields are required",
      message: "All fields are required",
  };
}

export function throwErrorOneFieldsRequired() {
  throw {
      httpStatus: 400,
      error: "At least one fields is required",
      message: "At least one fields is required",
  };
}


export function throwErrorNotAdmin() {
  throw {
      httpStatus: 403,
      error: "AdminDoesNotExist",
      message: " Only for Admins",
  };
}


// --------------------------
// ERRORES USUARIOS
// --------------------------
export function throwErrorEmailRequired() {
  throw {
      httpStatus: 400,
      error: "Email required",
      message: "Email required",
  };
}

export function throwErrorNameRequired() {
  throw {
      httpStatus: 400,
      error: "Name required",
      message: "Name required",
  };
}

export function throwErrorPasswordRequired() {
  throw {
      httpStatus: 400,
      error: "Password required",
      message: "Password required",
  };
}

export function throwErrorPasswordRequirements() {
  throw {
      httpStatus: 400,
      error: "Password requirements",
      message: "Password does not match requirements",
  };
}

export function throwErrorEmailInUse() {
  throw {
      httpStatus: 409,
      error: "Email in use",
      message: "Email in use",
  };
}

export function throwErrorCredentials() {
  throw {
      httpStatus: 401,
      error: "Error credentials",
      message: "Error credentials",
  };
}

export function throwErrorInvalidVerification() {
  throw {
      httpStatus: 400,
      error: "Invalid verification code",
      message: "Invalid verification code",
  };
}

export function throwErrorNameInUse() {
  throw {
      httpStatus: 409,
      error: "Name in use",
      message: "Name in use",
  };
}

export function throwErrorEmailAlreadyExists() {
  throw {
      httpStatus: 409,
      error: "Email already exists in database",
      message: "Email already exists in database",
  };
}

export function throwErrorUserNotDeleted() {
  throw {
      httpStatus: 400,
      error: "User could not be deleted",
      message: "User could not be deleted",
  };
}


// --------------------------
// ERRORES EJERCICIOS
// --------------------------
export function throwErrorExerciseDoesNotExist() {
  throw {
      httpStatus: 404,
      error: "ExerciseDoesNotExist",
      message: "Exercise does not exixt",
  };
}

export function throwErrorNameExerciseExist() {
  throw {
      httpStatus: 409,
      error: "ExerciseExist",
      message: "Name exercise already exixt",
  };
}

// --------------------------
// FILTROS
// --------------------------
export function throwErrorFilterDoesNotExist() {
  throw {
      httpStatus: 404,
      error: "FilterDoesNotExist",
      message: "Filter does not exist",
  };
}

// --------------------------
// FAVORITOS
// --------------------------
export function throwErrorFavouritesDoesNotExist() {
  throw {
      httpStatus: 404,
      error: "FavouritesDoesNotExist",
      message: "Exercise does not exixt",
  };
}











