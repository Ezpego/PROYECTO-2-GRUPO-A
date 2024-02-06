import "dotenv/config.js";
import express from "express";
import { db } from "./db/db-connection.js";
import { PORT, SERVER_HOST } from "./constants.js";
import { PUBLIC_DIR } from "./constants.js";
import filtersRoute from "./routes/filters.js";
import exercisesRoute from "./routes/exercises.js";
import usersRoute from "./routes/users.js";
import cors from "cors";

const app = express();
const jsonParser = express.json();
app.use(cors());

app.use(express.json());
app.use(jsonParser);
const staticFileHandler = express.static(PUBLIC_DIR);
app.use(staticFileHandler);

app.listen(PORT, () => {
  console.log(`Server is running on ${SERVER_HOST}`);

  // Verificar la conexión a la base de datos aquí
  db.execute("SELECT 1")
    .then(() => console.log("Connected to database successfully!"))
    .catch((err) =>
      console.error("Error connecting to database:", err.message)
    );
});

// --------------------------------
// Rutas usuarios
// --------------------------------

app.use(usersRoute);

// --------------------------------
// Rutas ejercicios
// --------------------------------

app.use(exercisesRoute);

// --------------------------------
//Rutas de filtrado
// --------------------------------

app.use(filtersRoute);

//---------
//middleware ruta no encontrad@
app.use((req, res) => {
  res.status(404).send({ status: "error", messaje: "ruta no encontrada" });
});

//middleware de errores
app.use((err, req, res, next) => {
  res.status(err.httpStatus || 500).json({
    status: "error",
    message: err.message,
  });
});
