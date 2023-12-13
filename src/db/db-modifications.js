import 'dotenv/config.js';
import connectDB from './create-pool.js';

const db = connectDB();

const DB_NAME = process.env.MYSQL_DB;

await db.query(`USE ${DB_NAME}`);

console.log(`Conectado a la base de datos : ${DB_NAME}`)
await db.query(`
UPDATE users
SET isAdministrator = TRUE
WHERE id = 1;
`);
console.log(`Actualización completada`);
