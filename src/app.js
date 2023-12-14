import 'dotenv/config.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db/db-connection.js';
import { PORT, SERVER_HOST } from './constants.js';
import { authMiddleware } from './middlewares/auth.js';
import { loggedInGuard } from "./middlewares/logged-in-guard.js";
import { sendRegisterConfirmation } from './utils/send-register-confirmation.js';

function generateReactivationCode() {
  const code = Math.floor(Math.random() * 9999) + 1000;
  return code.toString(); // Convierte el número en una cadena de texto
}
const app = express();

app.listen(PORT, () => {
    console.log(`Server is running on ${SERVER_HOST}`);

    // Verificar la conexión a la base de datos aquí
    db.execute("SELECT 1")
        .then(() => console.log("Connected to database successfully!"))
        .catch((err) =>
            console.error("Error connecting to database:", err.message)
        );
});

app.use(express.json());

app.post("/users/register", async (req, res) => {
    let { email, password, name } = req.body;
    try {
        //procedemos a validar los datos que nos llegan
        email = email.trim();
        console.log(email);
        name = name.trim();
        console.log(name);
        password = password.trim();
        console.log(password);
        if (!email) {
            const err = new Error("EMAIL IS REQUIRED");
            err.httpStatus = 400;
            throw err;
        }
        if (!name) {
            const err = new Error("NAME IS REQUIRED");
            err.httpStatus = 400;
            throw err;
        }
        if (!password) {
            const err = new Error("PASSWORD IS REQUIRED");
            err.httpStatus = 400;
            throw err;
        }

        if (
            password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[0-9]/.test(password)
        ) {
            const err = new Error("PASSWORD_DOES_NOT_MATCH_REQUIREMENTS");
            err.httpStatus = 400;
            throw err;
        }
        console.log("SELECT * FROM users WHERE email = ?", email);
        const [[maybeUserWithEmail]] = await db.execute(
            `SELECT * FROM users WHERE email = ? LIMIT 1`,
            [email]
        );
        console.log("Resultado de la consulta:", maybeUserWithEmail);

        if (!maybeUserWithEmail) {
            // No se encontró ningún usuario con este correo electrónico, proceder con la inserción
            const hashedPassword = await bcrypt.hash(password, 12);
            console.log("Insertando nuevo usuario:", name, email);
            await db.execute(
                `INSERT INTO users(name, email, password) 
        VALUES(?,?,?)`,
                [name, email, hashedPassword]
            );
            console;
            console.log("Usuario insertado correctamente:", name, email);
            res.status(200).send();
        } else {
            // El correo electrónico ya está en uso
            const err = new Error("EMAIL IN USE");
            err.httpStatus = 400;
            throw err;
        }
    } catch (err) {
        res.status(err.httpStatus || 500).json({
            status: "error",
            message: err.message,
        });
    }
});


// --------------------------------
// JSON TOKEN
// --------------------------------

app.post("/users/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // verificar??

        const [[isUser]] = await db.execute(
            `SELECT * FROM users WHERE email = ? LIMIT 1`,
            [email]
        );

        if (!isUser) {
              const err = new Error("error credentials");
            err.httpStatus = 400;
            throw err;
        }

        const doesPasswordMatch = await bcrypt.compare(
            password,
            isUser.password
        );

        if (!doesPasswordMatch) {
            const err = new Error("error credentials");
            err.httpStatus = 400;
            throw err;
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
    } catch (err) {
        res.status(err.httpStatus || 500).json({
            status: "error",
            message: err.message,
        });
    }

    const doesPasswordMatch = await bcrypt.compare(password, isUser.password);

    if (!doesPasswordMatch) {
      const err = new Error('error credentials');
      err.httpStatus = 400;
      throw err;
    }

    const [[existingDisabledUser]] = await db.execute(
      `SELECT * FROM users WHERE email = ? AND isEnabled = false`, 
      [email]
      );

      if (existingDisabledUser){
        const reactivationCode = generateReactivationCode();

        // Almacenamos el codigo generado en nuestra db
        await db.execute(
          'UPDATE users SET reactivation_code = ? WHERE email = ?',
          [reactivationCode, email]
        );

        await sendRegisterConfirmation(reactivationCode, existingDisabledUser.email);
        res.status(200).json({ message: 'Reactivation code sent successfully' });
      return;
      }



    const token = jwt.sign(
      {
        id: isUser.id,
        name: isUser.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    res.status(200).json({ token });
    return;
  } catch (err) {
    res.status(err.httpStatus || 500).json({
      status: 'error',
      message: err.message,
    });
  }
});

//! Añadir ruta para recuperar contraseña

app.patch('/users/reactivate_account', async (req, res) => {

  try {
    const { email, verificationcode} = req.body;
    // Añadir password para vovler a resetear una nueva contraseña

    const [[currentUser]] = await db.execute(`SELECT * FROM users WHERE email = ?`, 
    [email]
    );
    console.log(currentUser);
    console.log(verificationcode);
    console.log(email);

    if(verificationcode === currentUser.reactivation_code){
      await db.execute(`UPDATE users SET isEnabled = TRUE WHERE email= ?`,
      [email]
      );
      console.log(currentUser.reactivation_code);

      res.status(200).json({ message: 'Account reactivated successfully' });
    } else {
      const err = new Error('Invalid verification code');
      err.httpStatus = 400;
      throw err;

    }
    
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
 
});


app.use(authMiddleware);
app.use(loggedInGuard);
console.log(authMiddleware);
app.get("/prueba", (req, res) => {
    res.send(req.currentUser);
});


// USUARIO REGISTRADO (ADMINISTRADOR)

// REGISTRO DE UN NUEVO EJERCICIO

// !Añadir la misma logica para verificar el nombre del ejercicio
app.post('/exercises', async (req, res) =>{
try {
  // Obtenemos info del usuario actual logeado
  const currentUser = req.currentUser;
  console.log(currentUser);
  if(!currentUser || currentUser.isAdministrator !== 1){
    const err = new Error('Unauthorized : Only administrators can add exercises');
      err.httpStatus = 403;
      throw err;
  }
  // Obtenemos del 'body' los campos de la tabla exercises
  console.log(req.body);
  let { name, description, difficulty_level, image_url } = req.body; 
  console.log(name, description, difficulty_level);

  // Verificamos los datos recibidos
  if(!name || !description || !difficulty_level){
    const err = new Error('Incomplete data: Name, description and difficulty level are required');
      err.httpStatus = 400;
      throw err;
  }

  // Inserción de un nuevo ejercicio
  await db.execute(
    `INSERT INTO exercises(name, description, difficulty_level, image_url) VALUES(?,?,?,?)`,
    [name, description, difficulty_level, image_url || null]
  );

  res.status(201).json({ message: 'Exercise created successfully' });

} catch (err) {
  res.status(err.httpStatus || 500).json({ status: 'error', message: err.message });
}

});

// MODIFICAR UN EJERCICIO

app.patch('/exercises/:id', async (req, res) =>{
  try {

    // Obtenemos info del usuario actual logeado
  const currentUser = req.currentUser;
  if(!currentUser || currentUser.isAdministrator !== 1){
    const err = new Error('Unauthorized : Only administrators can modify exercises');
      err.httpStatus = 403;
      throw err;
  }
    // Obtenemos el id del ejercicio existente mediante el query params
    const exerciseId = req.params.id;

    // Obtenemos del 'body' los campos de la tabla exercises
    let { name, description, difficulty_level, image_url } = req.body; 
    
    // Verificamos los datos recibidos
  if(!name && !description && !difficulty_level){
    const err = new Error('At least one field is required');
      err.httpStatus = 400;
      throw err;
  }
  console.log(description);
  // CREAR LA LÓGICA PARA VERIFICAR QUE EL NOMBRE NO EXISTA

  const [[existingExerciseWithSameName]] = await db.execute(
    `SELECT * FROM exercises WHERE id = ? LIMIT 1`,
    [exerciseId]
  );
  console.log(existingExerciseWithSameName.name);
  
  if (existingExerciseWithSameName.name === name) {
    const err = new Error('Exercise name already exists');
    err.httpStatus = 400;
    throw err;
  }
  

  // Verificar si el ejercicio existe en la db
  const [[existingExercise]] = await db.execute(
    `SELECT * FROM exercises WHERE id = ? LIMIT 1`,
    [exerciseId]
  );
  if(!existingExercise){
    const err = new Error('Exercise not found');
    err.httpStatus = 400;
    throw err;
  }

  // Modificar el ejercicio localizado
  let updateValues = [];
  let updateQuery = 'UPDATE exercises SET ';

    if (name) {
      updateQuery += 'name = ?, ';
      updateValues.push(name);
    }
    if (description) {
      updateQuery += 'description = ?, ';
      updateValues.push(description);
    }
    if (difficulty_level) {
      updateQuery += 'difficulty_level = ?, ';
      updateValues.push(difficulty_level);
    }
    if (image_url) {
      updateQuery += 'image_url = ?, ';
      updateValues.push(image_url);
    }
    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ' WHERE id = ?';
    updateValues.push(exerciseId);

    await db.execute(updateQuery, updateValues);
    
    res.status(201).json({ message: 'Exercise updated successfully' });
  
  } catch (err) {
    res.status(err.httpStatus || 500).json({ status: 'error', message: err.message });
  }
  
  });


// ELIMINAR UN EJERCICIO

app.delete('/exercises/:id', async (req, res) =>{
  try {

    // Obtenemos info del usuario actual logeado
  const currentUser = req.currentUser;
  if(!currentUser || currentUser.isAdministrator !== 1){
    const err = new Error('Unauthorized : Only administrators can delete exercises');
      err.httpStatus = 403;
      throw err;
  }
    // Obtenemos el id del ejercicio existente mediante el query params
    const exerciseId = req.params.id;

    // Verificar si el ejercicio existe en la db
  const [[existingExercise]] = await db.execute(
    `SELECT * FROM exercises WHERE id = ? LIMIT 1`,
    [exerciseId]
  );

  if(!existingExercise){
    const err = new Error('Exercise not found');
    err.httpStatus = 400;
    throw err;
  }
  
  await db.execute(`DELETE FROM exercises WHERE id = ?`,
  [exerciseId]
  );

  res.status(201).json({ message: 'Exercise deleted successfully' });

  } catch (err) {
    res.status(err.httpStatus || 500).json({ status: 'error', message: err.message });
  }
  
  });


  // EDITAR PERFIL

app.patch('/user/:userId/editProfile', async (req, res) => {
  try {
    
    // Obtener datos user desde parametro url
    const userId = parseInt(req.params.userId);
    const currentUser = req.currentUser;
    console.log(userId);

    if(currentUser.id !== userId){
      const err = new Error('Unauthorized: You are not allowed to edit this profile');
      err.httpStatus = 403;
      throw err;
    }
    
    // Obtener los datos actualizados del cuerpo de la solicitud
    let {
      name,
      last_name,
      dni,
      birth_date,
      email,
      phone_number,
      profile_image_url,
      password,
    } = req.body;

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
        profile_image_url ||
        password
      )
    ) {
      const err = new Error('At least one field  is required for update');
      err.httpStatus = 400;
      throw err;
    }

    // Obtenemos los datos originales del usuario (Para el caso en que quiera cambiar el nombre y generemos un nuevo TOKEN)
    // let updateUserData = {...currentUser};
    // let tokenShouldBeUpdated = false;

    
    // Construir la consulta de actualización según los datos proporcionados
    let updateQuery = 'UPDATE users SET ';
    let updateValues = [];
    if(name && name === currentUser.name){
      name = name.trim();
      const err = new Error('This name is already in use');
      err.httpStatus = 400;
      throw err;
    }
    // && name !== currentUser.name (ESTO IRIA DENTRO DEL PRIMER IF)
    if (name) {
      name = name.trim();
      // updateUserData.name = name;
      // tokenShouldBeUpdated = true;
      updateQuery += 'name = ?, ';
      updateValues.push(name);
    }

    if (last_name) {
      updateQuery += 'last_name = ?, ';
      updateValues.push(last_name);
    }

    if (dni) {
      updateQuery += 'dni = ?, ';
      updateValues.push(dni);
    }

    if (birth_date) {
      updateQuery += 'birth_date = ?, ';
      updateValues.push(birth_date);
    }

    if (email) {
      const [[existingUserWithEmail]] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUserWithEmail && existingUserWithEmail.email === email) {
        const err = new Error('Email already exists in the database');
        err.httpStatus = 400;
        throw err;
      }
      updateQuery += 'email = ?, ';
      updateValues.push(email);
    }

    if (phone_number) {
      updateQuery += 'phone_number = ?, ';
      updateValues.push(phone_number);
    }

    if (profile_image_url) {
      updateQuery += 'profile_image_url = ?, ';
      updateValues.push(profile_image_url);
    }

    if (password) {
      password = password.trim();
    

    if (
      !password ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      const err = new Error('PASSWORD_DOES_NOT_MATCH_REQUIREMENTS');
      err.httpStatus = 400;
      throw err;
    }
    const hashedPassword = await bcrypt.hash(password, 12); 
      updateQuery += 'password = ?, '; 
      updateValues.push(hashedPassword);
  }
    updateQuery = updateQuery.slice(0, -2);

    updateQuery += ' WHERE id = ?';

    updateValues.push(userId);

    await db.execute(updateQuery, updateValues);

    // if (tokenShouldBeUpdated){
    //   const token = jwt.sign(
    //     {
    //       id: updateUserData.id,
    //       name: updateUserData.name,
    //     },
    //     process.env.JWT_SECRET,
    //     {
    //       expiresIn: '7d',
    //     }
    //   );
  
    //   res.status(200).json({ token });
    //   return;

    // }
    
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    res
      .status(err.httpStatus || 500)
      .json({ status: 'error', message: err.message });
  }
});


// DESHABILITAR EL PROPIO PERFIL POR EL USUARIO

app.patch('/user/:userId/disableProfile', async (req, res) => {
  try {
    // Obtener datos user desde parametro url
    const userId = parseInt(req.params.userId);
    const currentUser = req.currentUser;

    if(currentUser.id !== userId){
      const err = new Error('Unauthorized: You are not allowed to delete this profile');
      err.httpStatus = 403;
      throw err;
    }

    // Actualizar la columna isEnabled del propio usuario a false en la base de datos
    await db.execute('UPDATE users SET isEnabled = false WHERE id = ?', 
    [userId]
    );

    res.status(200).json({ message: 'Your profile has been disabled successfully' });
  } catch (err) {
    console.error(err); 
    res.status(err.httpStatus || 500).json({ status: 'error', message: err.message });
  }
});


// ELIMINACIÓN FISICA DE USUARIO (SOLO ADMINISTRADORES)

app.delete('/user/:userId/deleteProfile', async (req, res, next) => {

  try {
    const currentUser = req.currentUser;
  if(!currentUser || currentUser.isAdministrator !== 1){
    const err = new Error('Unauthorized : Only administrators can delete exercises');
      err.httpStatus = 403;
      throw err;
  }
   // Obtener el ID del usuario a eliminar
  const userIdToDelete = req.params.userId;
  const [existingUser] = await db.execute('SELECT id FROM users WHERE id = ?', [
    userIdToDelete,
  ]);

  if (!existingUser || existingUser.length === 0) {
    const err = new Error('User not found');
    err.httpStatus = 404;
    throw err;
  }


  const deletedUser = await db.execute('DELETE FROM users WHERE id = ?', [
    userIdToDelete,
  ]);

  if (!deletedUser) {
    const err = new Error('User could not be deleted');
    err.httpStatus = 403;
    throw err;
  }

      res.status(200).json({ message: 'Profile deleted successfully' });
    
  } catch (err) {
    res.status(err.httpStatus || 500).json({ status: 'error', message: err.message });
  }
});