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

// router.get(
//   "/exercises/",
//   wrapWithCatch(async (req, res) => {
//     // const currentUser = req.currentUser;
//     const { muscle_group, typology, customer_likes } = req.query;
//     const ownerId = req.currentUser.id;
//     let select_values = `SELECT exercises.* ,  muscle_group_id , typology_id , COUNT( DISTINCT likes.id) AS like_count`;
//     let from_values = ` FROM exercises  JOIN muscle_group_selection ON muscle_group_selection.exercises_id = exercises.id JOIN typology_selection ON typology_selection.exercises_id = exercises.id RIGHT JOIN likes ON likes.exercise_id = exercises.id `;
//     let group_params = `Group By exercises.id, muscle_group_id,typology_id `;
//     //let query_values = ` muscle_group_id , typology_id ,`;
//     if (muscle_group || typology || customer_likes) {
//       //query_values += ` JOIN `;
//       let query_params = [];
//       let query_where = `WHERE `;

//       if (muscle_group) {
//         //from_values += ` JOIN muscle_group_selection ON muscle_group_selection.exercises_id = exercises.id `;
//         query_params.push(muscle_group);
//         query_where += `muscle_group_selection.muscle_group_id = ? AND `;
//       }
//       if (typology) {
//         // from_values += `JOIN typology_selection ON typology_selection.exercises_id = exercises.id `;
//         query_params.push(typology);
//         query_where += `typology_selection.typology_id = ? AND `;
//       }
//       if (customer_likes) {
//         // from_values += `LEFT JOIN likes ON likes.exercise_id = exercises.id `;
//         query_params.push(ownerId);
//         query_where += `likes.user_id = ? AND `;
//         //select_values += `, COUNT(likes.id) AS like_count`;
//       }
//       //query_values = query_values.slice(0, -5);
//       query_where = query_where.slice(0, -5);
//       const [ejerciciofiltrado] = await db.execute(
//         `${select_values} ${from_values} ${query_where} ${group_params}`,
//         query_params
//       );
//       res.json(ejerciciofiltrado);
//     } else {
//       const [ejercicionofiltrado] = await db.execute(
//         // `SELECT exercises.* FROM exercises ORDER BY created_at DESC`
//         // cambiamos criterio de busqueda para sacar los likes por ejercicio
//         `SELECT exercises.*,
//           muscle_group_id,
//           typology_id,
//           COUNT(likes.id) AS like_count
//           FROM exercises
//           LEFT JOIN likes ON exercises.id = likes.exercise_id
//           LEFT JOIN muscle_group_selection ON exercises.id = muscle_group_selection.exercises_id
//           LEFT JOIN typology_selection ON exercises.id = typology_selection.exercises_id
//           GROUP BY exercises.id, muscle_group_id, typology_id
//           ORDER BY created_at DESC
//           LIMIT 20;`
//       );
//       res.json(ejercicionofiltrado);
//     }
//   })
// );
// // ruta actualizada gabisas
// router.get(
//   "/exercises/:id",
//   checkExercise,
//   wrapWithCatch(async (req, res) => {
//     const currentUser = req.currentUser;
//     const exercisesExist = req.exercises;
//     const id = req.params.id;
//     if (exercisesExist) {
//       const [[exercises]] = await db.execute(
//         `SELECT exercises.*,
//         muscle_group_id,
//         typology_id,
//         COUNT(likes.id) AS like_count
//         FROM exercises
//         LEFT JOIN likes ON exercises.id = likes.exercise_id
//         LEFT JOIN muscle_group_selection ON exercises.id = muscle_group_selection.exercises_id
//         LEFT JOIN typology_selection ON exercises.id = typology_selection.exercises_id
//         WHERE exercises.id = ?
//         GROUP BY exercises.id, muscle_group_id, typology_id
//         ORDER BY created_at DESC
//         LIMIT 20;`,
//         [id]
//       );
//       res.json(exercises);
//     } else {
//       res.status(400).json({ message: "Exercise does not exist" });
//     }
//   })
// );
// corregido para filtrado ejercicios
router.get(
  "/exercises/",
  wrapWithCatch(async (req, res) => {
    // const currentUser = req.currentUser;
    const { muscle_group, typology, difficulty_level } = req.query;
    const ownerId = req.currentUser.id;
    let select_values = `SELECT exercises.* ,  muscle_group_id , typology_id , COUNT( DISTINCT likes.id) AS like_count`;
    let from_values = ` FROM exercises  LEFT JOIN muscle_group_selection ON muscle_group_selection.exercises_id = exercises.id LEFT JOIN typology_selection ON typology_selection.exercises_id = exercises.id LEFT JOIN likes ON likes.exercise_id = exercises.id `;
    let group_params = `Group By exercises.id, muscle_group_id,typology_id `;
    //let query_values = ` muscle_group_id , typology_id ,`;
    if (muscle_group || typology || difficulty_level) {
      //query_values += ` JOIN `;
      let query_params = [];
      let query_where = `WHERE `;

      if (muscle_group) {
        //from_values += `LEFT JOIN muscle_group_selection ON muscle_group_selection.exercises_id = exercises.id `;
        query_params.push(muscle_group);
        query_where += `muscle_group_selection.muscle_group_id = ? AND `;
      }
      if (typology) {
        // from_values += `JOIN typology_selection ON typology_selection.exercises_id = exercises.id `;
        query_params.push(typology);
        query_where += `typology_selection.typology_id = ? AND `;
      }
      if (difficulty_level) {
        // from_values += `LEFT JOIN likes ON likes.exercise_id = exercises.id `;
        query_params.push(difficulty_level);
        query_where += `exercises.difficulty_level = ? AND `;
        //select_values += `, COUNT(likes.id) AS like_count`;
      }
      //query_values = query_values.slice(0, -5);
      query_where = query_where.slice(0, -5);
      const [ejerciciofiltrado] = await db.execute(
        `${select_values} ${from_values} ${query_where} ${group_params}`,
        query_params
      );
      res.json(ejerciciofiltrado);
    } else {
      const [ejercicionofiltrado] = await db.execute(
        // `SELECT exercises.* FROM exercises ORDER BY created_at DESC`
        // cambiamos criterio de busqueda para sacar los likes por ejercicio
        `SELECT exercises.*, 
          muscle_group_id, 
          typology_id, 
          COUNT(likes.id) AS like_count
          FROM exercises
          LEFT JOIN likes ON exercises.id = likes.exercise_id
          LEFT JOIN muscle_group_selection ON exercises.id = muscle_group_selection.exercises_id
          LEFT JOIN typology_selection ON exercises.id = typology_selection.exercises_id
          GROUP BY exercises.id, muscle_group_id, typology_id
          ORDER BY created_at DESC
          LIMIT 20;`
      );
      res.json(ejercicionofiltrado);
    }
  })
);

router.post(
  "/exercises/:id/likes", //! Aclarar que hay que cambiar el nombre de la rutareq
  checkExercise,
  checkLikeAndFavourite,
  wrapWithCatch(async (req, res) => {
    const currentUser = req.currentUser;
    const id = req.params.id;
    console.log(id);
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
  checkExercise,
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

//--------------
// ruta actualizada gabisas
// valores para el filtro frontend
router.get(
  "/filter",
  wrapWithCatch(async (req, res) => {
    const currentUser = req.currentUser;
    // añadimos id a la busqueda de ambos grupos musculares
    const [group_muscle] = await db.execute(
      `SELECT name, id FROM muscle_group `
    );
    const [group_typology] = await db.execute(`SELECT name, id FROM typology `);

    if (!group_muscle[0] || !group_typology[0]) {
      throwErrorFilterDoesNotExist();
    }
    const [likes] = await db.execute(
      `SELECT exercises.id, name FROM exercises JOIN likes ON likes.exercise_id = exercises.id WHERE likes.user_id = ?`,
      [currentUser.id]
    );
    // simplificacion datos enviados !!!!!!!!!
    res.json({
      muscle: group_muscle,
      typology: group_typology,
      likes: likes,
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
      `SELECT * FROM exercises JOIN favourites ON favourites.exercise_id = exercises.id WHERE favourites.user_id = ?`,
      [ownerId] //
    );
    res.json(customer_favourites);
  })
);

export default router;
