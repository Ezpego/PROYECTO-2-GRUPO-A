import "dotenv/config.js";
import { db } from "./db-connection.js";
import bcrypt from "bcrypt";

// tabla para alimentar elementos necesarios a la base de datos

console.log("prueba", process.env.MYSQL_DB);

console.log("creando administrador");

const passAdmin = await bcrypt.hash(process.env.PASSWORD_ADMIN, 12);
const emailAdmin = process.env.EMAIL_ADMIN;
const nameAdmin = process.env.NAME_ADMIN;

await db.query(
    `INSERT INTO users (name, email, password, isAdministrator) VALUES("${nameAdmin}","${emailAdmin}","${passAdmin}",true)`
);

console.log("alimentando typology table");

await db.query(
    `INSERT INTO typology(name) VALUES ("cardio"),("fuerza"),("elasticidad"),("potencia"),("estabilidad"),("resistencia muscular"),("funcional"),("rehabilitacion"),("otros")`
);

console.log("alimentando tabla muscle_group");

await db.query(
    `INSERT INTO muscle_group(name) VALUES ("espalda"),("pecho"),("brazos"),("hombros"),("piernas"),("cuello"),("core")`
);
await db.end();
