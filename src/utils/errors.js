export function throwUnauthorizedError() {
  throw {
    httpStatus: 401,
    error: "UNAUTHORIZED",
    message: "UNAUTHORIZED",
  };
}

export function throwErrorExerciseDoesNotExist() {
  throw {
    httpStatus: 401,
    error: "ExerciseDoesNotExist",
    message: "Exercise does not exist",
  };
}

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
    httpStatus: 400,
    error: "Email in use",
    message: "Email in use",
  };
}

export function throwErrorCredentials() {
  throw {
    httpStatus: 400,
    error: "Error credentials",
    message: "Error credentials",
  };
}

export function throwErrorUserNotFound() {
  throw {
    httpStatus: 400,
    error: "User not found",
    message: "User not found",
  };
}

export function throwErrorInvalidVerification() {
  throw {
    httpStatus: 400,
    error: "Invalid verification code",
    message: "Invalid verification code",
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

export function throwErrorNameInUse() {
  throw {
    httpStatus: 400,
    error: "Name in use",
    message: "Name in use",
  };
}

export function throwErrorEmailAlreadyExists() {
  throw {
    httpStatus: 400,
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

//---------------------
//--------------------

export function throwErrorFavouritesDoesNotExist() {
  throw {
    httpStatus: 401,
    error: "FavouritesDoesNotExist",
    message: "Exercise does not exixt",
  };
}

export function throwErrorFilterDoesNotExist() {
  throw {
    httpStatus: 401,
    error: "FilterDoesNotExist",
    message: "Filter does not exixt",
  };
}

export function throwErrorNotAdmin() {
  throw {
    httpStatus: 403,
    error: "AdminDoesNotExist",
    message: " Only for Admins",
  };
}

export function throwErrorNameExerciseExist() {
  throw {
    httpStatus: 401,
    error: "ExerciseExist",
    message: "Name exercise already exixt",
  };
}

export function throwErrorOnlyAdministrator() {
  throw {
    httpStatus: 401,
    error: "ExerciseExist",
    message: "Administrator exercise already exixt",
  };
}

export function throwErrorSomeInformationAreRequired() {
  throw {
    httpStatus: 405,
    error: "NeedsMoreData",
    message:
      "Incomplete data: Name, description, difficulty level, photo,typology and muscle group are required",
  };
}
