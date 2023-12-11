DROP DATABASE IF EXISTS dbGym;

CREATE DATABASE dbGym;

USE dbGym;

CREATE TABLE users (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dni VARCHAR(20),
    birth_date DATE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(20) CHECK(
        CHAR_LENGTH(password) >=8 AND 
        password REGEXP '[A-Z]' AND
        password REGEXP '[0-9]'
        ),
    phone_number VARCHAR(20),
    profile_image_url VARCHAR(50),
    isEnable BOOLEAN DEFAULT TRUE,
    isAdministrator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    
    );

CREATE TABLE typology (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE muscle_group (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE exercises (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    description VARCHAR(200) NOT NULL,
    image_url VARCHAR(50),
    difficulty_level VARCHAR(20) CHECK (
        difficulty_level IN ('Low', 'Medium', 'High')
        ) NOT NULL,
    created_by INT UNSIGNED,
    updated_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id),
    FOREIGN KEY (updated_by) REFERENCES users (id)
    );

CREATE TABLE typology_selection (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    exercises_id INT UNSIGNED,
    typology_id INT UNSIGNED,
    FOREIGN KEY (exercises_id) REFERENCES exercises(id),
    FOREIGN KEY (typology_id) REFERENCES typology(id)
    );

CREATE TABLE muscle_group_selection (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    exercises_id INT UNSIGNED,
    muscle_group_id INT UNSIGNED,
    FOREIGN KEY (exercises_id) REFERENCES exercises(id),
    FOREIGN KEY (muscle_group_id) REFERENCES muscle_group(id)
    );

CREATE TABLE likes (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED,
    exercises_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exercises_id) REFERENCES exercises(id)
    );

CREATE TABLE favourites (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED,
    exercise_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    )