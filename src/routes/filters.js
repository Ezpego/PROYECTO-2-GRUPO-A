import "dotenv/config.js";
import express from "express";
import { db } from "../db/db-connection.js";
import { wrapWithCatch } from "../utils/wrap-with-catch.js";

import { authMiddleware } from "../middlewares/auth.js";
import { loggedInGuard } from "../middlewares/logged-in-guard.js";

import {
    checkExercise,
    checkLikeAndFavourite,
} from "../middlewares/do-exercises-exist.js";
import { throwErrorFilterDoesNotExist } from "../utils/errors.js";
import { DIFFICULTY_LEVEL } from "../constants.js";

const router = express.Router();


router.use(authMiddleware);
router.use(loggedInGuard);


router.get(
    "/exercises/",
    wrapWithCatch(async (req, res) => {
        // const currentUser = req.currentUser;
        const { muscle_group, typology, customer_likes } = req.query;
        const ownerId = req.currentUser.id;
        let query_values = `SELECT exercises.* FROM exercises `;

        if (muscle_group || typology || customer_likes) {
            query_values += ` JOIN `;
            let query_params = [];
            let query_where = `WHERE `;

            if (muscle_group) {
                query_values += `muscle_group_selection ON muscle_group_selection.exercises_id = exercises.id JOIN muscle_group ON muscle_group_selection.muscle_group_id = muscle_group.id JOIN `;
                query_params.push(muscle_group);
                query_where += `muscle_group.name = ? AND `;
            }
            if (typology) {
                query_values += `typology_selection ON typology_selection.exercises_id = exercises.id JOIN typology ON typology.id = typology_selection.typology_id JOIN `;
                query_params.push(typology);
                query_where += `typology.name = ? AND `;
            }
            if (customer_likes) {
                query_values += `likes ON likes.exercises_id = exercises.id JOIN `;
                query_params.push(ownerId);
                query_where += `likes.user_id = ? AND `;
            }
            query_values = query_values.slice(0, -5);
            query_where = query_where.slice(0, -5);
            const [ejerciciofiltrado] = await db.execute(
                `${query_values} ${query_where}`,
                query_params
            );
            res.json(ejerciciofiltrado);
        } else {
            const [ejercicionofiltrado] = await db.execute(query_values);
            res.json(ejercicionofiltrado);
        }
    })
);

router.get(
    "/exercises/:id",
    checkExercise,
    wrapWithCatch(async (req, res) => {
        const currentUser = req.currentUser;
        const exercisesExist = req.exercises;
        const id = req.params.id;
        if (exercisesExist) {
            const [[exercises]] = await db.execute(
                `SELECT * FROM exercises WHERE id = ?`,
                [id]
            );
            res.json(exercises);
        } else {
            res.status(400).json({ message: "Exercise does not exist" });
        }
    })
);

router.post(
    "/exercises/:id/likes", //! Aclarar que hay que cambiar el nombre de la rutareq
    checkLikeAndFavourite,
    wrapWithCatch(async (req, res) => {
        const currentUser = req.currentUser;
        const id = req.params.id;
        const exist = req.likeAndFavourite;
        console.log(exist);
        if (exist) {
            await db.execute(
                `DELETE FROM likes WHERE user_id = ? AND exercise_id = ?`,
                [currentUser.id, id]
            );
            res.status(200).json({ message: "Like deleted successfully" });
        } else {
            await db.execute(
                `INSERT INTO likes (user_id,exercise_id ) VALUES (?,?)`,
                [currentUser.id, id]
            );
            res.status(200).json({ message: "Like added successfully" });
        }
    })
);

router.post(
    "/exercises/:id/favourites",
    checkLikeAndFavourite,
    wrapWithCatch(async (req, res) => {
        const currentUser = req.currentUser;
        const id = req.params.id;
        const exist = req.likeAndFavourite;
        console.log(exist);
        if (exist) {
            await db.execute(
                `DELETE FROM favourites WHERE user_id = ? AND exercise_id = ?`,
                [currentUser.id, id]
            );
            res.status(200).json({
                message: "Exercises deleted successfully",
            });
        } else {
            await db.execute(
                `INSERT INTO favourites (user_id,exercise_id ) VALUES (?,?)`,
                [currentUser.id, id]
            );
            res.status(200).json({
                message: "Exercises added successfully",
            });
        }
    })
);
//-------------
// Añadido Gabriel
//--------------

// valores para el filtro frontend
router.get(
    "/filter",
    wrapWithCatch(async (req, res) => {
        const currentUser = req.currentUser;
        const [group_muscle] = await db.execute(
            `SELECT name FROM muscle_group `
        );
        const [group_typology] = await db.execute(`SELECT name FROM typology `);

        if (!group_muscle[0] || !group_typology[0]) {
            throwErrorFilterDoesNotExist();
        }
        const [likes] = await db.execute(
            `SELECT exercises.id, name FROM exercises JOIN likes ON likes.exercises_id = exercises.id WHERE likes.user_id = ${currentUser.id}`
        );
        res.json({
            muscle: [group_muscle],
            typology: [group_typology],
            likes: [likes],
            difficulty_level: DIFFICULTY_LEVEL,
        });
    })
);

// Favoritos
//-----------------

router.get(
    "/favourites",
    wrapWithCatch(async (req, res, next) => {
        const ownerId = req.currentUser.id;

        const [customer_favourites] = await db.execute(
            `SELECT * FROM exercises JOIN favourites ON favourites.exercises_id = exercises.id WHERE favourites.user_id = ?`,
            [ownerId] //
        );
        res.json({ id: [customer_favourites] });
    })
);

export default router;
