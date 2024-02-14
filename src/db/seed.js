import "dotenv/config.js";
import { db } from "./db-connection.js";
import bcrypt from "bcrypt";
import { PUBLIC_DIR } from "../constants.js";
import { SERVER_HOST } from "../constants.js";

console.log("prueba", process.env.MYSQL_DB);

console.log("creando administrador");

const generatePassword = async () => {
  try {
    const passAdmin = await bcrypt.hash(process.env.PASSWORD_ADMIN, 12);
    return passAdmin;
  } catch (error) {
    console.error("Error al generar la contraseña:", error);
    throw error;
  }
};

const main = async () => {
  const url_route = `${SERVER_HOST}/photos/`;
  try {
    const password = await generatePassword();
    const emailAdmin = process.env.EMAIL_ADMIN;
    const nameAdmin = process.env.NAME_ADMIN;

    await db.query(
      `INSERT INTO users (name, email, password, isAdministrator) VALUES("${nameAdmin}","${emailAdmin}","${password}",true)`
    );

    console.log("alimentando typology table");

    await db.query(
      `INSERT INTO typology(name) VALUES ("Cardio"),("Fuerza"),("Elasticidad"),("Potencia"),("Estabilidad"),("Resistencia Muscular"),("Funcional"),("Rehabilitacion"),("Otros")`
    );

    console.log("alimentando tabla muscle_group");

    await db.query(
      `INSERT INTO muscle_group(name) VALUES ("Espalda"),("Pecho"),("Brazos"),("Hombros"),("Piernas"),("Cuello"),("Core")`
    );

    // Creacion ejercicios de ejemplo

    console.log(
      "Insertando ejercicios y relacionando con grupos musculares y tipologías..."
    );

    // Definir los datos de los ejercicios, grupos musculares y tipologías
    const exerciseData = [
      {
        name: "Ejercicio 1",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "Medium",
        muscle_groups: [1],
        typologies: [1],
        image_url: `${url_route}1b8e8745-620c-4b84-9cd2-c1d2b1551b0.jpeg`,
      },
      {
        name: "Ejercicio 2",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "High",
        muscle_groups: [2],
        typologies: [2],
        image_url: `${url_route}4c5161d7-6d60-4b83-ba9a-e5eeacba686.jpeg`,
      },
      {
        name: "Ejercicio 3",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "Low",
        muscle_groups: [3],
        typologies: [3],
        image_url: `${url_route}9dacac58-2c64-4abd-ac47-b148593186c.jpeg`,
      },
      {
        name: "Ejercicio 4",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "High",
        muscle_groups: [4],
        typologies: [4],
        image_url: `${url_route}9fa2bbc1-10ec-4f16-93c1-22367645cc8.jpeg`,
      },
      {
        name: "Ejercicio 5",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "Medium",
        muscle_groups: [5],
        typologies: [5],
        image_url: `${url_route}14b279a8-3ccc-4f6d-8751-a1ac0581e51.jpeg`,
      },
      {
        name: "Ejercicio 6",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "Low",
        muscle_groups: [6],
        typologies: [6],
        image_url: `${url_route}34f06ee6-d792-41f6-b096-6594663ffef.jpeg`,
      },
      {
        name: "Ejercicio 7",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "High",
        muscle_groups: [7],
        typologies: [7],
        image_url: `${url_route}4c5161d7-6d60-4b83-ba9a-e5eeacba686.jpeg`,
      },
      {
        name: "Ejercicio 8",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "Medium",
        muscle_groups: [1],
        typologies: [8],
        image_url: `${url_route}a8ddc2a2-6f7e-45ff-b067-3e92217b41e.jpeg`,
      },
      {
        name: "Ejercicio 9",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "Low",
        muscle_groups: [2],
        typologies: [9],
        image_url: `${url_route}ab7402b8-f8d7-492d-9f3e-99ee9335f83.jpeg`,
      },
      {
        name: "Ejercicio 10",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "High",
        muscle_groups: [3],
        typologies: [1],
        image_url: `${url_route}bef0aab2-3c84-4756-8411-250f8308320.jpeg`,
      },
      {
        name: "Ejercicio 11",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "Medium",
        muscle_groups: [4],
        typologies: [2],
        image_url: `${url_route}c017abfb-7715-43b8-ba2f-49ae28ee107.jpeg`,
      },
      {
        name: "Ejercicio 12",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "Low",
        muscle_groups: [5],
        typologies: [3],
        image_url: `${url_route}de4e04fe-a4d0-47e1-a339-cf627e90b27.jpeg`,
      },
      {
        name: "Ejercicio 13",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "High",
        muscle_groups: [6],
        typologies: [4],
        image_url: `${url_route}e24f750c-ba06-46db-be19-bb1ae89e8b8.jpeg`,
      },
      {
        name: "Ejercicio 14",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "Medium",
        muscle_groups: [7],
        typologies: [5],
        image_url: `${url_route}f6b6b75a-21c8-4daa-aeb9-a59e50ffca0.jpeg`,
      },
      {
        name: "Ejercicio 15",
        description:
          "Aquí se describe las caracteristicas de ejecución y beneficios del ejercicio indicado",
        difficulty_level: "Low",
        muscle_groups: [1],
        typologies: [6],
        image_url: `${url_route}fc686dd5-c4fb-4f5e-8efe-a1aca83f633.jpeg`,
      },
    ];

    // Insertar ejercicios y obtener los IDs generados
    let contadorId = 0;
    for (const exercise of exerciseData) {
      contadorId++;
      const result = await db.query(
        `
        INSERT INTO exercises (name, description, difficulty_level,image_url)
        VALUES (?, ?, ?,?)`,
        [
          exercise.name,
          exercise.description,
          exercise.difficulty_level,
          exercise.image_url,
        ]
      );

      const exerciseId = contadorId;

      // Insertar relaciones con grupos musculares
      for (const muscleGroupId of exercise.muscle_groups) {
        await db.query(
          `
            INSERT INTO muscle_group_selection (exercises_id, muscle_group_id)
            VALUES (?, ?)`,
          [exerciseId, muscleGroupId]
        );
      }

      // Insertar relaciones con tipologías
      for (const typologyId of exercise.typologies) {
        await db.query(
          `
            INSERT INTO typology_selection (exercises_id, typology_id)
            VALUES (?, ?)`,
          [exerciseId, typologyId]
        );
      }
    }

    console.log(
      "Ejercicios insertados y relaciones establecidas con grupos musculares y tipologías."
    );
    await db.end();
  } catch (error) {
    console.error("Error durante la ejecución:", error);
  }
};

main();
