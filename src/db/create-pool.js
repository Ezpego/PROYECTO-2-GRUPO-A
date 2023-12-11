import mysql from "mysql2/promise.js";


console.log("CONECTANDO CON LA BASE DE DATOS");

function createConnectionPool(dbName) {
  const connectionPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: dbName
  });

  return connectionPool;
}

export default createConnectionPool;