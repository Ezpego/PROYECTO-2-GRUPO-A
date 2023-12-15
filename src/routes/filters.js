import "dotenv/config.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db/db-connection.js";
import { PORT, SERVER_HOST } from "./constants.js";
import { authMiddleware } from "./middlewares/auth.js";
import { loggedInGuard } from "./middlewares/logged-in-guard.js";
import { sendRegisterConfirmation } from "./utils/send-register-confirmation.js";
import { wrapWithCatch } from "./utils/wrap-with-catch.js";
import fileUpload from "express-fileupload";
import path from "path";
import crypto from "crypto";
import { PUBLIC_DIR } from "./constants.js";
import { UploadFiles } from "./utils/UploadFiles.js";
import { profile } from "console";
import filtersRoute from "./rutas/filters.js";
import authMiddlewa from "../middlewares/auth.js";
import loggedInGuard from "../middlewares/logged-in-guard.js";
import {
    checkExercise,
    checkLikeAndFavourite,
} from "../middlewares/do-exercises-exist.js";

const router = express.Router();

router.use(authMiddlewa);
router.use(loggedInGuard);

router.get(
    "/exercise/",
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

router.get("/exercises/:id", checkExercise, async (req, res) => {
    const currentUser = req.currentUser;
    const exercisesExist = req.exercises;
    const id = req.params.id;
    if (exercisesExist) {
        try {
            const [[exercises]] = await db.execute(
                `SELECT * FROM exercises WHERE id = ?`,
                [id]
            );
            res.json(exercises);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    } else {
        res.status(400).json({ message: "Exercise does not exist" });
    }
});

router.post("/exercises/:id/like", checkLikeAndFavourite, async (req, res) => {
    const currentUser = req.currentUser;
    const id = req.params.id;
    const exist = req.likeAndFavourite;
    try {
        if (exist) {
            await db.execute(
                `DELETE FROM likes WHERE user_id = ? AND exercises_id = ?`,
                [currentUser.id, id]
            );
            res.status(200).json({ message: "Like deleted successfully" });
        } else {
            await db.execute(
                `INSERT INTO likes (user_id,exercises_id ) VALUES (?,?)`,
                [currentUser.id, id]
            );
            res.status(200).json({ message: "Like added successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post(
    "/exercises/:id/favourites",
    checkLikeAndFavourite,
    async (req, res) => {
        const currentUser = req.currentUser;
        const id = req.params.id;
        const exist = req.likeAndFavourite;
        try {
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
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);
//-------------
//Añadido Gabriel
//--------------

// valores para el filtro frontend

router.get("/filter", async (req, res) => {
    // sacamos el usuario validado
    const ownerId = req.currentUser.id;
    const [customer_likes] = await db.execute(
        `SELECT exercises.id , name FROM exercises JOIN likes ON likes.exercises_id = exercises.id WHERE likes.user_id = ?`,
        [ownerId]
        // dar valores a la tabla favoritos para ver si funciona
    );
    const [group_muscle] = await db.execute(`SELECT name FROM muscle_group`);
    const [group_typology] = await db.execute(`SELECT name FROM typology`);
    res.json({
        muscle: [group_muscle],
        typology: [group_typology],
        likes: [customer_likes],
    });
});

// Favoritos
//-----------------

router.get("/favourites", async (req, res, next) => {
    const ownerId = req.currentUser.id;
    try {
        const [customer_favourites] = await db.execute(
            `SELECT * FROM exercises JOIN favourites ON favourites.exercise_id = exercises.id WHERE favourites.user_id = ?`,
            [ownerId]
        );
        res.json({ id: [customer_favourites] });
    } catch (err) {
        next(err);
    }
});

export default router;
