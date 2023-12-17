import "dotenv/config.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fileUpload from "express-fileupload";
import { db } from "../db/db-connection.js";
import { sendRegisterConfirmation } from "../utils/send-register-confirmation.js";
import { UploadFiles } from "../utils/UploadFiles.js";
import { wrapWithCatch } from "../utils/wrap-with-catch.js";
import { authMiddleware } from "../middlewares/auth.js";
import { loggedInGuard } from "../middlewares/logged-in-guard.js";
import {
  throwErrorEmailRequired,
  throwErrorNameRequired,
  throwErrorPasswordRequired,
  throwErrorPasswordRequirements,
  throwErrorEmailInUse,
  throwErrorCredentials,
  throwErrorUserNotFound,
  throwErrorInvalidVerification,
  throwErrorAllFieldsRequired,
  throwUnauthorizedError,
  throwErrorUserNotDeleted,
  throwErrorOneFieldsRequired,
} from "../utils/errors.js";

const router = express.Router();

function generateReactivationCode() {
  const code = Math.floor(Math.random() * 9999) + 1000;
  return code.toString(); // Convierte el número en una cadena de texto
}

router.post(
  "/users/register",
  wrapWithCatch(async (req, res) => {
    let { email, password, name } = req.body;
    //procedemos a validar los datos que nos llegan
    email = email.trim();
    name = name.trim();
    password = password.trim();
    if (!email) {
      throwErrorEmailRequired();
    }
    if (!name) {
      throwErrorNameRequired();
    }
    if (!password) {
      throwErrorPasswordRequired();
    }

    if (
      !password ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      throwErrorPasswordRequirements();
    }
    const [[maybeUserWithEmail]] = await db.execute(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!maybeUserWithEmail) {
      // No se encontró ningún usuario con este correo electrónico, proceder con la inserción
      const hashedPassword = await bcrypt.hash(password, 12);
      await db.execute(
        `INSERT INTO users(name, email, password) 
        VALUES(?,?,?)`,
        [name, email, hashedPassword]
      );
      res.status(200).send("Usuario creado correctamente");
    } else {
      // El correo electrónico ya está en uso
      throwErrorEmailInUse();
    }
  })
);

// --------------------------------
// JSON TOKEN
// --------------------------------

router.post(
  "/users/login",
  wrapWithCatch(async (req, res) => {
    const { email, password } = req.body;

    const [[isUser]] = await db.execute(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    const [[existingDisabledUser]] = await db.execute(
      `SELECT * FROM users WHERE email = ? AND isEnabled = false`,
      [email]
    );

    if (existingDisabledUser) {
      const reactivationCode = generateReactivationCode();

      // Almacenamos el codigo generado en nuestra db
      await db.execute(
        "UPDATE users SET reactivation_code = ? WHERE email = ?",
        [reactivationCode, email]
      );

      await sendRegisterConfirmation(
        reactivationCode,
        existingDisabledUser.email
      );
      res.status(200).json({
        message: "Reactivation code sent successfully",
      });
      return;
    }

    if (!isUser) {
      throwErrorCredentials();
    }

    const doesPasswordMatch = await bcrypt.compare(password, isUser.password);

    if (!doesPasswordMatch) {
      throwErrorCredentials();
    }

    const token = jwt.sign(
      {
        id: isUser.id,
        name: isUser.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({ token });
    return;
  })
);
//RUTA PARA REACTIVAR CONTRASEÑA
router.patch(
  "/users/forgottenPassword",
  wrapWithCatch(async (req, res) => {
    const { email } = req.body;
    const [[currentUser]] = await db.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    if (!currentUser) {
      throwErrorUserNotFound();
    }

    const reactivationCode = generateReactivationCode();

    // Almacenamos el codigo generado en nuestra db
    await db.execute("UPDATE users SET reactivation_code = ? WHERE email = ?", [
      reactivationCode,
      email,
    ]);

    await sendRegisterConfirmation(reactivationCode, email);
    res.status(200).json({
      message: "Reactivation code sent successfully",
    });
    return;
  })
);

router.patch(
  "/users/reactivate_account",
  wrapWithCatch(async (req, res) => {
    const { email, verificationcode, password } = req.body;

    const [[currentUser]] = await db.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    if (!currentUser) {
      throwErrorUserNotFound();
    }

    if (!email || !verificationcode || !password) {
      throwErrorAllFieldsRequired();
    }
    if (
      !password ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      throwErrorPasswordRequirements();
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    if (verificationcode === currentUser.reactivation_code) {
      await db.execute(
        `UPDATE users SET password = ?, isEnabled = TRUE WHERE email= ?`,
        [hashedPassword, email]
      );
      res.status(200).json({
        message: "Account reactivated successfully",
      });
    } else {
      throwErrorInvalidVerification();
    }
  })
);

router.use(authMiddleware);
router.use(loggedInGuard);
router.use(fileUpload());
// EDITAR PERFIL

router.patch(
  "/user/:userId/editProfile",
  wrapWithCatch(async (req, res, next) => {
    // Obtener datos user desde parametro url
    const userId = parseInt(req.params.userId);
    console.log(userId);
    const currentUser = req.currentUser;
    console.log(currentUser.id);
    if (currentUser.id !== userId) {
      throwUnauthorizedError();
    }

    // Obtener los datos actualizados del cuerpo de la solicitud
    let { name, last_name, dni, birth_date, email, phone_number, password } =
      req.body;
    const profilePhoto = req.files?.photo;
    console.log(profilePhoto);
    const address = "profile";
    let profile_image_url;
    // Validar los datos actualizados, asegurarse de que al menos uno de ellos sea no nulo

    if (name) {
      name = name.trim();
    }

    if (email) {
      email = email.trim();
    }

    if (password) {
      password = password.trim();
    }

    if (
      !(
        name ||
        last_name ||
        dni ||
        birth_date ||
        email ||
        phone_number ||
        profilePhoto ||
        password
      )
    ) {
      throwErrorOneFieldsRequired();
    }

    // Construir la consulta de actualización según los datos proporcionados
    let updateQuery = "UPDATE users SET ";
    let updateValues = [];

    if (name) {
      name = name.trim();

      updateQuery += "name = ?, ";
      updateValues.push(name);
    }

    if (last_name) {
      updateQuery += "last_name = ?, ";
      updateValues.push(last_name);
    }

    if (dni) {
      updateQuery += "dni = ?, ";
      updateValues.push(dni);
    }

    if (birth_date) {
      updateQuery += "birth_date = ?, ";
      updateValues.push(birth_date);
    }

    if (email) {
      const [[existingUserWithEmail]] = await db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existingUserWithEmail && existingUserWithEmail.email === email) {
        throwErrorEmailInUse();
      }
      updateQuery += "email = ?, ";
      updateValues.push(email);
    }

    if (phone_number) {
      updateQuery += "phone_number = ?, ";
      updateValues.push(phone_number);
    }

    if (password) {
      password = password.trim();

      if (
        !password ||
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password)
      ) {
        throwErrorPasswordRequirements();
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      updateQuery += "password = ?, ";
      updateValues.push(hashedPassword);
    }
    if (profilePhoto) {
      const [[existingOldUrl]] = await db.execute(
        "SELECT profile_image_url FROM users WHERE id = ?",
        [currentUser.id]
      );
      profile_image_url = await UploadFiles(
        profilePhoto,
        address,
        existingOldUrl.profile_image_url
      );

      if (profile_image_url) {
        updateQuery += "profile_image_url = ?, ";
        updateValues.push(profile_image_url);
      }
    }
    updateQuery = updateQuery.slice(0, -2);

    updateQuery += " WHERE id = ?";

    updateValues.push(userId);

    await db.execute(updateQuery, updateValues);

    res.status(200).json({ message: "Profile updated successfully" });
  })
);

// DESHABILITAR EL PROPIO PERFIL POR EL USUARIO

router.patch(
  "/user/:userId/disableProfile",
  wrapWithCatch(async (req, res) => {
    // Obtener datos user desde parametro url
    const userId = parseInt(req.params.userId);
    const currentUser = req.currentUser;

    if (currentUser.id !== userId && currentUser.isAdministrator === 0) {
      throwUnauthorizedError();
    }

    // Actualizar la columna isEnabled del propio usuario a false en la base de datos
    await db.execute("UPDATE users SET isEnabled = false WHERE id = ?", [
      userId,
    ]);

    res.status(200).json({
      message: "Your profile has been disabled successfully",
    });
  })
);

// ELIMINACIÓN FISICA DE USUARIO (SOLO ADMINISTRADORES)

router.delete(
  "/user/:userId/deleteProfile",
  wrapWithCatch(async (req, res, next) => {
    const currentUser = req.currentUser;
    if (!currentUser || currentUser.isAdministrator !== 1) {
      throwUnauthorizedError();
    }
    // Obtener el ID del usuario a eliminar
    const userIdToDelete = req.params.userId;
    const [existingUser] = await db.execute(
      "SELECT id FROM users WHERE id = ?",
      [userIdToDelete]
    );

    if (!existingUser || existingUser.length === 0) {
      throwErrorUserNotFound();
    }

    const deletedUser = await db.execute("DELETE FROM users WHERE id = ?", [
      userIdToDelete,
    ]);

    if (!deletedUser) {
      throwErrorUserNotDeleted();
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  })
);

export default router;
