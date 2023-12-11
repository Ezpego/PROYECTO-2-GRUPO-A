import 'dotenv/config.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db/db-connection.js';
import { PORT, SERVER_HOST } from './constants.js';

const app = express();

app.listen(PORT, () => {
  console.log(`Server is running on ${SERVER_HOST}`);
  
  // Verificar la conexión a la base de datos aquí
  db.execute('SELECT 1')
    .then(() => console.log('Connected to database successfully!'))
    .catch((err) => console.error('Error connecting to database:', err.message));
});

app.use(express.json());

app.post('/users/register', async (req, res) => {
  let { email, password, name } = req.body;
  try {
    //procedemos a validar los datos que nos llegan
    email = email.trim();
    name = name.trim();
    password = password.trim();
    if (!email) {
      const err = new Error(
        'EMAIL IS REQUIRED'
      );err.httpStatus = 400;
      throw err;
    }
    if (!name) {
      const err = new Error(
        'NAME IS REQUIRED'
      );err.httpStatus = 400;
      throw err;
    }
    if (!password) {
      const err = new Error(
        'PASSWORD IS REQUIRED'
      );err.httpStatus = 400;
      throw err;
    }
    
    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new Error('PASSWORD_DOES_NOT_MATCH_REQUIREMENTS');
    }
    console.log('SELECT * FROM users WHERE email = ?', email);
    const [[maybeUserWithEmail]] = await db.execute(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    console.log('Resultado de la consulta:', maybeUserWithEmail);

    if (!maybeUserWithEmail) {
      // No se encontró ningún usuario con este correo electrónico, proceder con la inserción
      const hashedPassword = await bcrypt.hash(password, 12);
      console.log('Insertando nuevo usuario:', name, email);
      await db.execute(
        `INSERT INTO users(name, email, password) 
        VALUES(?,?,?)`,
        [name, email, hashedPassword]
      );
      console
      console.log('Usuario insertado correctamente:', name, email);
      res.status(200).send();
    } else {
      // El correo electrónico ya está en uso
      const err = new Error(
        'EMAIL IN USE'
      );err.httpStatus = 400;
      throw err;
    }
    
  } catch (err) {
    res.status(err.httpStatus || 500).json({
      status: "error",
      message: err.message,
    });
  }
});
