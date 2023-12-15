export function throwUnauthorizedError() {
    throw {
        httpStatus: 401,
        error: "UNAUTHORIZED",
    };
}

export function throwErrorExerciseDoesNotExist() {
    throw {
        httpStatus: 401,
        error: "ExerciseDoesNotExist",
        message: "Exercise does not exixt",
    };
}
