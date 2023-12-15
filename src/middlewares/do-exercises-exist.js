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

import { throwErrorExerciseDoesNotExist } from "../utils/errors.js";
import { db } from "../db/db-connection.js";

export async function checkLikeAndFavourite(req, res, next) {
    const id = req.params.id;
    const pathSegments = req.path.split("/");
    const editProfile = pathSegments[pathSegments.length - 1];
    const [[Exist]] = await db.execute(`SELECT * FROM ? WHERE id = ? `, [
        editProfile,
        id,
    ]);
    try {
        if (!Exist) {
            throwErrorExerciseDoesNotExist();
        } else {
            req.likeAndFavourite = Exist;
        }
    } catch (err) {
        next(err);
    }
    next();
}
