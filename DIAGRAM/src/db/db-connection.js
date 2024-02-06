import createConnectionPool from "./create-pool.js";

export const db = createConnectionPool(process.env.MYSQL_DB);
