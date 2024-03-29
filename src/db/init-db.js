import "dotenv/config.js";
import connectDB from "./create-pool.js";

const db = connectDB();

const DB_NAME = process.env.MYSQL_DB;

console.log(process.env.MYSQL_HOST);
console.log(process.env.MYSQL_USER);
console.log(process.env.MYSQL_PASS);
console.log(process.env.MYSQL_DB);

console.log("Limpiando base de datos vieja...");
await db.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);

console.log("Creando base de datos...");
await db.query(`CREATE DATABASE ${DB_NAME}`);

await db.query(`USE ${DB_NAME}`);

console.log("Creando tabla users...");
await db.query(`
CREATE TABLE users (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    last_name VARCHAR(50),
    dni VARCHAR(20),
    birth_date DATE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(60) CHECK(
        CHAR_LENGTH(password) >=8 AND 
        password REGEXP '[A-Z]' AND
        password REGEXP '[0-9]'
        ) NOT NULL,
    phone_number VARCHAR(20),
    profile_image_url VARCHAR(200),
    current_token VARCHAR(255),
    isEnabled BOOLEAN DEFAULT TRUE,
    isAdministrator BOOLEAN DEFAULT FALSE,
    reactivation_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    
    );
`);

console.log("Creando tabla typology...");
await db.query(`
CREATE TABLE typology (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
    );
`);

console.log("Creando tabla muscle group...");
await db.query(`
CREATE TABLE muscle_group (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
    );
`);

console.log("Creando tabla exercises...");
await db.query(`
CREATE TABLE exercises (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(3000) NOT NULL,
    image_url VARCHAR(200),
    difficulty_level VARCHAR(20) CHECK (
        difficulty_level IN ('Low', 'Medium', 'High')
        ) NOT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
    );
`);

console.log("Creando tabla typology selection...");
await db.query(`
CREATE TABLE typology_selection (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    exercises_id INT UNSIGNED,
    typology_id INT UNSIGNED,
    FOREIGN KEY (exercises_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (typology_id) REFERENCES typology(id)
    );
`);

console.log("Creando tabla muscle group selection...");
await db.query(`
CREATE TABLE muscle_group_selection (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    exercises_id INT UNSIGNED,
    muscle_group_id INT UNSIGNED,
    FOREIGN KEY (exercises_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (muscle_group_id) REFERENCES muscle_group(id)
    );
`);

console.log("Creando tabla likes...");
await db.query(`
CREATE TABLE likes (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED,
    exercise_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );
`);

console.log("Creando la tabla favourites...");
await db.query(`
CREATE TABLE favourites (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED,
    exercise_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );
`);

await db.end();
