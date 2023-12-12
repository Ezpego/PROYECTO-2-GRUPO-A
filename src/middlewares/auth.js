import jwt from 'jsonwebtoken';
import { db } from '../db/db-connection.js';

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      const [[user]] = await db.execute(
        `SELECT id,name, email  FROM users WHERE id = ? AND isEnabled = TRUE LIMIT  1`,
        [id]
      );

      req.currentUser = user;
    } catch (err) {
      console.log(err);
    }
  }
  next();
}
