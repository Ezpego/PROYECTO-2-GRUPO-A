import "dotenv/config.js";
import express from "express";
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
import filtersRoute from "./routes/filters.js";
import usersRoute from "./routes/users.js";

// !const jsonParser = express.json();

const app = express();
const jsonParser = express.json();
app.use(jsonParser);
const staticFileHandler = express.static(PUBLIC_DIR);
app.use(staticFileHandler);

app.use(fileUpload());

app.listen(PORT, () => {
  console.log(`Server is running on ${SERVER_HOST}`);

  // Verificar la conexión a la base de datos aquí
  db.execute("SELECT 1")
    .then(() => console.log("Connected to database successfully!"))
    .catch((err) =>
      console.error("Error connecting to database:", err.message)
    );
});

// !app.use(express.json());

// app.use(authMiddleware);
// !app.use(loggedInGuard); // Lo metemos en el app o en cada archivo de rutas?

// USUARIO REGISTRADO (ADMINISTRADOR)

// --------------------------------
//Rutas de filtrado
// --------------------------------

app.use(filtersRoute);
app.use(usersRoute);
app.use(exercises);
//---------
//middleware ruta no encontrad@
app.use((req, res) => {
  res.status(404).send({ status: "error", messaje: "ruta no encontrada" });
});

//middleware de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.httpStatus || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});
