// REGISTRO DE UN NUEVO EJERCICIO
app.use(fileUpload());

app.post("/exercises", async (req, res) => {
    console.log("cuerpo:", req.body);
    try {
        // Obtenemos info del usuario actual logeado
        const currentUser = req.currentUser;
        console.log(currentUser);
        if (!currentUser || currentUser.isAdministrator !== 1) {
            const err = new Error(
                "Unauthorized : Only administrators can add exercises"
            );
            err.httpStatus = 403;
            throw err;
        }

        let { name, description, difficulty_level, typology, muscle_group } =
            req.body;
        // Verificamos los datos recibidos
        console.log("Dato 1: ", name);
        console.log("Dato 2: ", description);
        console.log("Dato 3: ", difficulty_level);
        console.log("Dato 5: ", typology);
        const photo = req.files?.photo;
        console.log("Dato 4: ", photo);

        if (
            !name ||
            !description ||
            !difficulty_level ||
            !photo ||
            !muscle_group ||
            !typology
        ) {
            const err = new Error(
                "Incomplete data: Name, description and difficulty level are required"
            );
            err.httpStatus = 400;
            throw err;
        }

        const [[existingExerciseWithSameName]] = await db.execute(
            `
      SELECT * FROM exercises WHERE name = ? LIMIT 1`,
            [name]
        );

        if (
            existingExerciseWithSameName &&
            existingExerciseWithSameName.name === name
        ) {
            const err = new Error("Exercise name already exists");
            err.httpStatus = 400;
            throw err;
        }

        const address = "photos";
        const URL = await UploadFiles(photo, address);
        console.log(URL);

        // Inserción de un nuevo ejercicio
        await db.execute(
            `INSERT INTO exercises(name, description, difficulty_level, image_url) VALUES(?,?,?,?)`,
            [name, description, difficulty_level, URL]
        );
        //insercion seleccion typologia
        const [[exercise_id]] = await db.execute(
            `SELECT * FROM exercises WHERE name = ?`,
            [name]
        );
        console.log(exercise_id.id);
        await db.execute(
            `INSERT INTO typology_selection(typology_id, exercises_id) VALUES(?,?)`,
            [typology, exercise_id.id]
        );

        //inserccion muscle_group selection

        await db.execute(
            `INSERT INTO muscle_group_selection(muscle_group_id, exercises_id) VALUES(?,?)`,
            [muscle_group, exercise_id.id]
        );

        res.status(201).json({ message: "Exercise created successfully" });
    } catch (err) {
        res.status(err.httpStatus || 500).json({
            status: "error",
            message: err.message,
        });
    }
});

// MODIFICAR UN EJERCICIO

app.patch("/exercises/:id", async (req, res) => {
    try {
        // Obtenemos info del usuario actual logeado
        const currentUser = req.currentUser;
        if (!currentUser || currentUser.isAdministrator !== 1) {
            const err = new Error(
                "Unauthorized : Only administrators can modify exercises"
            );
            err.httpStatus = 403;
            throw err;
        }
        // Obtenemos el id del ejercicio existente mediante el query params
        const exerciseId = req.params.id;

        // Obtenemos del 'body' los campos de la tabla exercises
        let {
            name,
            description,
            difficulty_level,
            image_url,
            typology_selection,
            muscle_group_selection,
        } = req.query;
        console.log(
            "valores Obtenidos",
            name,
            description,
            difficulty_level,
            image_url,
            typology_selection,
            muscle_group_selection
        );
        // Verificamos los datos recibidos
        if (!name && !description && !difficulty_level) {
            const err = new Error("At least one field is required");
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

        const [[existingExerciseWithSameNameTable]] = await db.execute(
            `SELECT * FROM exercises WHERE name = ? LIMIT 1`,
            [name]
        );
        if (
            existingExerciseWithSameNameTable &&
            existingExerciseWithSameNameTable.name === name
        ) {
            const err = new Error("Exercise name already exists");
            err.httpStatus = 400;
            throw err;
        }

        // Verificar si el ejercicio existe en la db
        const [[existingExercise]] = await db.execute(
            `SELECT * FROM exercises WHERE id = ? LIMIT 1`,
            [exerciseId]
        );
        if (!existingExercise) {
            const err = new Error("Exercise not found");
            err.httpStatus = 400;
            throw err;
        }

        // Modificar el ejercicio localizado
        let updateValues = [];
        let updateQuery = "UPDATE exercises SET ";

        if (name) {
            updateQuery += "name = ?, ";
            updateValues.push(name);
        }
        if (description) {
            updateQuery += "description = ?, ";
            updateValues.push(description);
        }
        if (difficulty_level) {
            updateQuery += "difficulty_level = ?, ";
            updateValues.push(difficulty_level);
        }
        if (image_url) {
            updateQuery += "image_url = ?, ";
            updateValues.push(image_url);
        }
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += " WHERE id = ?";
        updateValues.push(exerciseId);

        await db.execute(updateQuery, updateValues);

        if (typology_selection) {
            await db.execute(
                `UPDATE typology_selection SET typology_id = ? WHERE exercises_id = ?`,
                [typology_selection, exerciseId]
            );
        }
        if (muscle_group_selection) {
            await db.execute(
                `UPDATE muscle_group_selection SET muscle_group_id = ? WHERE exercises_id = ?`,
                [muscle_group_selection, exerciseId]
            );
        }

        res.status(201).json({ message: "Exercise updated successfully" });
    } catch (err) {
        res.status(err.httpStatus || 500).json({
            status: "error",
            message: err.message,
        });
    }
});

// ELIMINAR UN EJERCICIO

app.delete("/exercises/:id", async (req, res) => {
    try {
        // Obtenemos info del usuario actual logeado
        const currentUser = req.currentUser;
        if (!currentUser || currentUser.isAdministrator !== 1) {
            const err = new Error(
                "Unauthorized : Only administrators can delete exercises"
            );
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

        if (!existingExercise) {
            const err = new Error("Exercise not found");
            err.httpStatus = 400;
            throw err;
        }

        await db.execute(`DELETE FROM exercises WHERE id = ?`, [exerciseId]);

        res.status(201).json({ message: "Exercise deleted successfully" });
    } catch (err) {
        res.status(err.httpStatus || 500).json({
            status: "error",
            message: err.message,
        });
    }
});
