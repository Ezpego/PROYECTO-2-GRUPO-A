import { throwErrorExerciseDoesNotExist } from "../utils/errors.js";
import { db } from "../db/db-connection.js";

export async function checkExercise(req, res, next) {
    const id = req.params.id;
    const [[exercisesExist]] = await db.execute(
        `SELECT * FROM exercises WHERE id = ? `,
        [id]
    );
    try {
        if (!exercisesExist) {
            throwErrorExerciseDoesNotExist();
        } else {
            req.exercises = exercisesExist;
        }
    } catch (err) {
        next(err);
    }
    next();
}
