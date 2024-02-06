import "dotenv/config.js";
import { db } from "./db-connection.js";
import bcrypt from "bcrypt";

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
    try {
        const password = await generatePassword();
        const emailAdmin = process.env.EMAIL_ADMIN;
        const nameAdmin = process.env.NAME_ADMIN;

        await db.query(
            `INSERT INTO users (name, email, password, isAdministrator) VALUES("${nameAdmin}","${emailAdmin}","${password}",true)`
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
    } catch (error) {
        console.error("Error durante la ejecución:", error);
    }
};

main();
