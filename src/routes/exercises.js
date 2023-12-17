import "dotenv/config.js";
import express from "express";
import { db } from "../db/db-connection.js";
import fileUpload from "express-fileupload";
import { authMiddleware } from "../middlewares/auth.js";
import { loggedInGuard } from "../middlewares/logged-in-guard.js";
import { wrapWithCatch } from "../utils/wrap-with-catch.js";
import { UploadFiles } from "../utils/UploadFiles.js";
import {
    throwErrorExerciseDoesNotExist,
    throwErrorNameExerciseExist,
    throwErrorNotAdmin,
    throwErrorSomeInformationAreRequired,
} from "../utils/errors.js";

const router = express.Router();
router.use(authMiddleware);
router.use(loggedInGuard);
router.use(fileUpload());

router.post(
    "/exercises",
    wrapWithCatch(async (req, res) => {
        // Obtenemos info del usuario actual logeado
        const currentUser = req.currentUser;
        console.log(currentUser);
        if (!currentUser || currentUser.isAdministrator !== 1) {
            throwErrorNotAdmin();
        }
        //Obtenemos datos del body
        let { name, description, difficulty_level, typology, muscle_group } =
            req.body;
        const photo = req.files?.photo;

        if (
            !name ||
            !description ||
            !difficulty_level ||
            !photo ||
            !muscle_group ||
            !typology
        ) {
            throwErrorSomeInformationAreRequired();
        }

        const [[existingExerciseWithSameName]] = await db.execute(
            `
          SELECT * FROM exercises WHERE name = ? LIMIT 1`,
            [name]
        );

        if (
            existingExerciseWithSameName &&
            existingExerciseWithSameName.name === name
        ) {
            throwErrorNameExerciseExist();
        }
        const address = "photos";
        const URL = await UploadFiles(photo, address);

        // Inserción de un nuevo ejercicio
        await db.execute(
            `INSERT INTO exercises(created_by, name, description, difficulty_level, image_url) VALUES(?,?,?,?,?)`,
            [currentUser.id, name, description, difficulty_level, URL]
        );
        //insercion seleccion typologia
        const [[exercise_id]] = await db.execute(
            `SELECT * FROM exercises WHERE name = ?`,
            [name]
        );
        console.log(exercise_id.id);
        await db.execute(
            `INSERT INTO typology_selection(typology_id, exercises_id) VALUES(?,?)`,
            [typology, exercise_id.id]
        );

        //inserccion muscle_group selection

        await db.execute(
            `INSERT INTO muscle_group_selection(muscle_group_id, exercises_id) VALUES(?,?)`,
            [muscle_group, exercise_id.id]
        );

        res.status(201).json({ message: "Exercise created successfully" });
    })
);

// MODIFICAR UN EJERCICIO

router.patch(
    "/exercises/:id",
    wrapWithCatch(async (req, res) => {
        // Obtenemos info del usuario actual logeado
        const currentUser = req.currentUser;
        if (!currentUser || currentUser.isAdministrator !== 1) {
            throwErrorNotAdmin();
        }
        // Obtenemos el id del ejercicio existente mediante el query params
        const exerciseId = req.params.id;

        // Obtenemos del 'body' los campos de la tabla exercises
        let {
            name,
            description,
            difficulty_level,
            typology_selection,
            muscle_group_selection,
            image_url,
        } = req.query;
        const photo = req.files?.photo;
        let image_url_old;

        const [[existingExerciseinDB]] = await db.execute(
            `SELECT * FROM exercises WHERE id = ? LIMIT 1`,
            [exerciseId]
        );
        if (!existingExerciseinDB) {
            throwErrorExerciseDoesNotExist();
        }
        if (name) {
            const [[existingExerciseWithSameNameTable]] = await db.execute(
                `SELECT * FROM exercises WHERE name = ? LIMIT 1`,
                [name]
            );
            if (
                existingExerciseWithSameNameTable &&
                existingExerciseWithSameNameTable.name === name
            ) {
                throwErrorNameExerciseExist();
            }
        }

        // Modificar el ejercicio localizado usando un comando SQL modular en funcion de los elementos a actualizar
        let updateValues = [];
        let updateQuery = "UPDATE exercises SET ";

        if (name) {
            updateQuery += "name = ?, ";
            updateValues.push(name);
        }
        if (description) {
            updateQuery += "description = ?, ";
            updateValues.push(description);
        }
        if (difficulty_level) {
            updateQuery += "difficulty_level = ?, ";
            updateValues.push(difficulty_level);
        }
        if (photo) {
            if (existingExerciseinDB.image_url) {
                image_url_old = existingExerciseinDB.image_url;
            }
            const address = "photos";
            image_url = await UploadFiles(photo, address, image_url_old);
            if (image_url) {
                updateQuery += "image_url = ?, ";
                updateValues.push(image_url);
            }
        }
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += " WHERE id = ?";
        updateValues.push(exerciseId);
        if (image_url || name || description || difficulty_level) {
            await db.execute(updateQuery, updateValues);
        }

        if (typology_selection) {
            await db.execute(
                `UPDATE typology_selection SET typology_id = ? WHERE exercises_id = ?`,
                [typology_selection, exerciseId]
            );
        }
        if (muscle_group_selection) {
            await db.execute(
                `UPDATE muscle_group_selection SET muscle_group_id = ? WHERE exercises_id = ?`,
                [muscle_group_selection, exerciseId]
            );
        }

        res.status(201).json({ message: "Exercise updated successfully" });
    })
);

// ELIMINAR UN EJERCICIO

router.delete(
    "/exercises/:id",
    wrapWithCatch(async (req, res) => {
        // Obtenemos info del usuario actual logeado
        const currentUser = req.currentUser;
        if (!currentUser || currentUser.isAdministrator !== 1) {
            throwErrorNotAdmin();
        }
        // Obtenemos el id del ejercicio existente mediante el query params
        const exerciseId = req.params.id;

        // Verificar si el ejercicio existe en la db
        const [[existingExercise]] = await db.execute(
            `SELECT * FROM exercises WHERE id = ? LIMIT 1`,
            [exerciseId]
        );

        if (!existingExercise) {
            throwErrorExerciseDoesNotExist();
        }

        await db.execute(`DELETE FROM exercises WHERE id = ?`, [exerciseId]);

        res.status(201).json({ message: "Exercise deleted successfully" });
    })
);

export default router;
