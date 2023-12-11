import 'dotenv/config.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db/db-connection.js';
import { PORT, SERVER_HOST } from './constants.js';

const app = express();

app.listen(PORT, () => {
  console.log(SERVER_HOST);
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
      throw new Error({
        httpStatus: 400,
        error: 'EMAIL_IS_REQUIRED',
      });
    }
    if (!name) {
      throw new Error({
        httpStatus: 400,
        error: 'NAME_IS_REQUIRED',
      });
    }
    if (!password) {
      throw new Error({
        httpStatus: 400,
        error: 'PASSWORD_IS_REQUIRED',
      });
    }
    if (
      !password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      throw new Error({
        httpStatus: 400,
        error: 'PASSWORD_IS_NOT_CORRECT',
      });
    }
    const [[maybeUserWithEmail]] = await db.execute(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    if (maybeUserWithEmail) {
      throw new Error({
        httpStatus: 400,
        error: 'EMAIL_IN_USE',
      });
    }
    //Encriptamos la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    await db.execute(
      `INSERT INTO users(name, email, password) 
    VALUES(?,?,?)`,
      [name, email, hashedPassword]
    );
    res.status(200).send();
  } catch (error) {
    res
      .status(error.httpStatus || 500)
      .json({ error: error.error || 'Internal Server Error' });
  }
});
