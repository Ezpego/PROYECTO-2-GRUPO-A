import "dotenv/config.js";
import { join } from "path";
import fs from "fs/promises";
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
        isAdministrator: isUser.isAdministrator,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    // *INTRODUCIMOS EL TOKEN GENERADO EN LA NUEVA COLUMNA CREADA EN LA TABLA USERS (current_token)
    await db.execute("UPDATE users SET current_token = ? WHERE email = ?", [
      token,
      isUser.email,
    ]);

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

    // await sendRegisterConfirmation(reactivationCode, email);
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

      //* GENERAMOS UN NUEVO TOKEN DESPUÉS DE CAMBIAR LA CONTRASEÑA
      const newToken = jwt.sign(
        {
          id: currentUser.id,
          name: currentUser.name,
          isAdministrator: currentUser.isAdministrator,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      //* ACTUALIZAMOS TOKEN ACTUAL
      await db.execute(`UPDATE users SET current_token = ? WHERE email = ?`, [
        newToken,
        currentUser.email,
      ]);

      res.status(200).json({
        newToken,
        message: "Account reactivated successfully",
      });
    } else {
      throwErrorInvalidVerification();
    }
  })
);

// * RUTA PARA DEVOLVER DATOS DE UN USUARIO CONCRETO
// * RUTA AÑADIDA EZEQUIEL

router.get(
  "/users/data",
  wrapWithCatch(async (req, res) => {
    // USAMOS EL SPLIT PARA SEPARAR EL TOKEN DE LA PALABRA BEARER DEL HEADER/AUTH
    const token = req.headers.authorization;

    try {
      // const secretKey = process.env.JWT_SECRET;
      // // ES NECESARIO INCLUIR LA SECRETKEY PARA HACER LA VALIDACION, DE NO PONERLA NO LO VERIFICA
      // const verify = jwt.verify(token, secretKey);
      // console.log('token verify: ', verify);

      const [[userFromDatabase]] = await db.execute(
        "SELECT * FROM users WHERE current_token = ? LIMIT 1",
        [token]
      );

      if (!userFromDatabase) {
        throwErrorUserNotFound();
      }
      const userData = {
        id: userFromDatabase.id,
        name: userFromDatabase.name,
        last_name: userFromDatabase.last_name,
        dni: userFromDatabase.dni,
        email: userFromDatabase.email,
        birth_date: userFromDatabase.birth_date,
        phone_number: userFromDatabase.phone_number,
        profile_image_url: userFromDatabase.profile_image_url,
        isAdministrator: userFromDatabase.isAdministrator,
        current_token: userFromDatabase.current_token,
      };

      res.json(userData);
    } catch (error) {
      console.error("Error al verificar el token:", error);
      res.status(401).json({ error: "Token inválido" });
    }
  })
);

router.use(authMiddleware);
router.use(loggedInGuard);
router.use(fileUpload());

// RUTA AÑADIDA PARA TRAER DATOS DE UN USUARIO, SOLO ADMIN
// *AÑADIDA 06.02.24

router.get(
  "/users/:email",
  wrapWithCatch(async (req, res) => {
    const email = req.params.email;
    const token = req.headers.authorization;
    console.log("EMAIL: ", email);

    try {
      const [[adminUserFromDatabase]] = await db.execute(
        "SELECT * FROM users WHERE current_token = ? LIMIT 1",
        [token]
      );
      console.log(adminUserFromDatabase);

      if (adminUserFromDatabase.isAdministrator !== 1) {
        throwUnauthorizedError();
      } else {
        const [[userFromDatabase]] = await db.execute(
          "SELECT * FROM users WHERE email = ? LIMIT 1",
          [email]
        );

        console.log("ruta de usuario para admin", userFromDatabase);
        if (!userFromDatabase) {
          throwErrorUserNotFound();
        }

        const userData = {
          id: userFromDatabase.id,
          name: userFromDatabase.name,
          last_name: userFromDatabase.last_name,
          dni: userFromDatabase.dni,
          email: userFromDatabase.email,
          birth_date: userFromDatabase.birth_date,
          phone_number: userFromDatabase.phone_number,
          profile_image_url: userFromDatabase.profile_image_url,
          isAdministrator: userFromDatabase.isAdministrator,
          isEnabled: userFromDatabase.isEnabled,
          current_token: userFromDatabase.current_token,
        };
        res.json(userData);
      }
    } catch (error) {
      console.error("Error al buscar el usuario por email:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  })
);

// RUTA PARA COMPROBAR CONTRASEÑA
// *AÑADIDA 31.24

router.post(
  "/users/pass",
  wrapWithCatch(async (req, res) => {
    const { email, currentPassword } = req.body;
    console.log("EMAIL USERS PASS", email);
    console.log("CURRENT PASSWORD USERS PASS", currentPassword);

    const [[isUser]] = await db.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (!isUser) {
      console.error("USUARITO NO ENCONTRADITO");
      throwErrorUserNotFound();
    }

    const doesPasswordMatch = await bcrypt.compare(
      currentPassword,
      isUser.password
    );

    if (doesPasswordMatch) {
      res.status(200).json({ message: "La contraseña es válida" });
    } else {
      throwErrorCredentials();
    }
  })
);

// EDITAR PERFIL

router.patch(
  "/user/:userId/editProfile",
  wrapWithCatch(async (req, res, next) => {
    // Obtener datos user desde parametro url
    const userId = parseInt(req.params.userId);
    console.log(userId);
    const currentUser = req.currentUser;
    console.log("currentUser:", currentUser);
    let newToken;
    if (currentUser.id !== userId) {
      throwUnauthorizedError();
    }

    // Obtener los datos actualizados del cuerpo de la solicitud
    let { name, last_name, dni, birth_date, email, phone_number, password } =
      req.body;
    console.log(req.body);
    const profilePhoto = req.files?.photo;
    // console.log(profilePhoto);
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
    console.log(req.body);
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

    if (birth_date && birth_date !== " ") {
      updateQuery += "birth_date = ?, ";
      updateValues.push(birth_date);
    }

    if (email) {
      const [[existingUserWithEmail]] = await db.execute(
        "SELECT * FROM users WHERE email = ? AND id !=?",
        [email, userId]
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
      newToken = jwt.sign(
        {
          id: currentUser.id,
          name: currentUser.name,
          isAdministrator: currentUser.isAdministrator,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      updateQuery += "current_token = ?, ";
      updateValues.push(newToken);
    }
    if (profilePhoto) {
      console.log("Uploading profile photo...");
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

    res.status(200).json({
      newToken,
      message: "Profile updated successfully",
    });
  })
);

//EDITAR PERFILES DESDE EL ADMINISTRADOR

router.patch(
  "/userGestion/:userId/editProfile",
  wrapWithCatch(async (req, res, next) => {
    // Obtener datos user desde parametro url
    const userId = parseInt(req.params.userId);
    console.log(userId);
    const currentUser = req.currentUser;
    console.log("currentUser:", currentUser);
    let newToken;
    if (currentUser.isAdministrator !== 1) {
      throwUnauthorizedError();
    }

    // Obtener los datos actualizados del cuerpo de la solicitud
    let {
      name,
      last_name,
      dni,
      birth_date,
      email,
      phone_number,
      password,
      isAdministrator,
      isEnabled,
    } = req.body;
    console.log(req.body);
    const profilePhoto = req.files?.photo;
    // console.log(profilePhoto);
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
        password ||
        isAdministrator ||
        isEnabled
      )
    ) {
      throwErrorOneFieldsRequired();
    }
    console.log(req.body);
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

    if (birth_date && birth_date !== " ") {
      updateQuery += "birth_date = ?, ";
      updateValues.push(birth_date);
    }

    if (email) {
      const [[existingUserWithEmail]] = await db.execute(
        "SELECT * FROM users WHERE email = ? AND id !=?",
        [email, userId]
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
      newToken = jwt.sign(
        {
          id: currentUser.id,
          name: currentUser.name,
          isAdministrator: currentUser.isAdministrator,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      updateQuery += "current_token = ?, ";
      updateValues.push(newToken);
    }
    if (profilePhoto) {
      console.log("Uploading profile photo...");
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
    if (
      isEnabled === true ||
      isEnabled === "true" ||
      isEnabled === 1 ||
      isEnabled === "1" ||
      isEnabled === undefined
    ) {
      console.log("isEnabled", isEnabled);
      updateQuery += "isEnabled = ?, ";
      updateValues.push(1);
      console.log("valor", updateValues);
      console.log("query", updateQuery);
    } else {
      console.log("isEnabled", isEnabled);
      updateQuery += "isEnabled = ?, ";
      updateValues.push(0);
      console.log("valor", updateValues);
      console.log("query", updateQuery);
    }

    if (
      isAdministrator === true ||
      isAdministrator === "true" ||
      isAdministrator === 1 ||
      isAdministrator === "1"
    ) {
      console.log("isAdministrator", isAdministrator);
      updateQuery += "isAdministrator = ?, ";
      updateValues.push(1);
      console.log("valor", updateValues);
      console.log("query", updateQuery);
    } else {
      console.log("isAdministrator", isAdministrator);
      updateQuery += "isAdministrator = ?, ";
      updateValues.push(0);
      console.log("valor", updateValues);
      console.log("query", updateQuery);
    }

    updateQuery = updateQuery.slice(0, -2);

    updateQuery += " WHERE id = ?";

    updateValues.push(userId);

    await db.execute(updateQuery, updateValues);

    res.status(200).json({
      newToken,
      message: "Profile updated successfully",
    });
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

// RUTA PARA ELIMINAR FOTO DE PERFIL
// *AÑADIDA EZEQUIEL 08.02.24

router.delete(
  "/users/:userId/deleteProfilePhoto",
  wrapWithCatch(async (req, res, next) => {
    const currentUser = req.currentUser;
    const userId = req.params.userId;
    console.log("CURRENCITO USERCITO", currentUser);

    if (!currentUser) {
      throwUnauthorizedError();
    }

    console.log("USERCITO IDECITO", userId);

    const [userData] = await db.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    console.log("DATITAUSERCITO", userData);

    if (!userData || userData.length === 0) {
      throwErrorUserNotFound();
    }

    const userProfileImage = userData[0].profile_image_url;

    if (!userProfileImage) {
      console.error("No se encontró la URL de la foto de perfil.");
      res.status(400).json({
        error: "No se encontró la URL de la foto de perfil.",
      });
      return;
    }

    try {
      const urlParts = new URL(userProfileImage);
      const fileName = urlParts.pathname.split("/").pop();

      const currentWorkingDirectory = process.cwd();
      console.log("WORKINCITO DIRECTORY", currentWorkingDirectory);

      const dynamicBasePath = join(
        currentWorkingDirectory,
        "public",
        "profile"
      );

      const pathToDelete = join(dynamicBasePath, fileName);
      console.log("PATHECITO TO DELETECITO", pathToDelete);

      const fileExists = await fs
        .access(pathToDelete)
        .then(() => true)
        .catch(() => false);

      if (fileExists) {
        try {
          await fs.unlink(pathToDelete);
          await db.execute(
            "UPDATE users SET profile_image_url = null WHERE id = ?",
            [userId]
          );
          console.log("File deleted successfully");
          res.status(200).json({
            message: "Profile photo deleted successfully",
          });
        } catch (error) {
          console.error("Error deleting file:", error);
          res.status(500).json({ error: "Error deleting file" });
        }
      } else {
        console.error("El archivo no existe en la ruta especificada.");
        res.status(404).json({
          error: "El archivo no existe en la ruta especificada.",
        });
      }
    } catch (error) {
      console.error("Error parsing URL:", error);
      res.status(500).json({ error: "Error parsing URL" });
    }
  })
);

export default router;
