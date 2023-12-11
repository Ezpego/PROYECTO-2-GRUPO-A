# PROYECTO-2-GRUPO-A

TÍTULO
Aplicación para organizar internamente los entrenamientos en un gimnasio.
DESCRIPCIÓN
Implementar una API que permite publicar ejercicios para la gestión de los mismos en un
gimnasio.
USUARIOS ANÓNIMOS

- Registro (Nombre, Email y Password) - Login (Email y Password)
  USUARIO ADMINISTRADOR
  ● Será el único a poder añadir un nuevo ejercicio:
  ○ nombre
  ○ descripción
  ○ foto
  ○ tipología
  ○ grupo muscular
  ● Puede modificar o eliminar un entrenamiento
  USUARIOS (NO ADMINISTRADOR)
- Puede ver el listado de los ejercicios y entrar en el detalle de los mismos. - Podrá filtrarlos por algunas características (ej: tipología o grupo muscular). - Podrá poner o quitar un like a un ejercicio.
  OPCIONAL
  ● Los usuarios (no administrador) pueden seleccionar algunos ejercicios para ponerlos
  entre los favoritos, útil para poder organizar una clase de entrenamiento.

## ENDPOINTS

### USUARIOS ANÓNIMOS

- **Registro de un usuario nuevo**
  - `POST '/users/register'`
  <!-- - **Validación de email**
  - `PUT '/users/validate'` -->

### USUARIOS REGISTRADOS (NO ADMINISTRADOR)

<!-- - **Olvido de contraseña**
  - `POST '/users/password/recover'` -->

- **Iniciar sesión**
  - `POST '/users/login'`
- **Edición de perfil**
  - `POST '/user/:userId/editProfile'`
  - `PUT '/user/:userId/editProfile'`

### USUARIOS REGISTRADOS (ADMINISTRADOR)

- **Registro de un nuevo ejercicio**
  - `POST '/exercises'`
- **Modificar ejercicio (Nombre, Descripción, Tipología, Grupo muscular)**
  - `PUT '/exercises/:id'`
- **Eliminar ejercicio**
  - `DELETE '/exercises/:id'`
  <!-- - **Eliminar Usuario**
  - `DELETE '/users/:id'` -->

### PÁGINA PRINCIPAL, BUSQUEDA DE EJERCICIOS

- **Mostrar ejercicios**(ordenador por mas recientes)
  - `GET '/exercises'`
- **Devuelve info de un ejercicio concreto**
  - `GET '/exercises/:id'`
- **Like a un ejercicio**
  - `POST '/exercises/:id/like'`
- **Añadir a favoritos**
  - `POST '/exercises/:id/favourites'`
- **Eliminar de favoritos**
  - `DELETE '/exercises/:id/favourites'`

### FILTRO

- **Listado de tipología**
  - `GET 'exercises/exercise-typology'`
- **Listado de grupos musculares**
  - `GET 'exercises/muscle-groups'`
- **Listado de likes**
  - `GET 'exercises/exercise-likes'`

### PÁGINA PRINCIPAL, MOSTRAR FAVORITOS

- **Ver lista de favoritos**
  - `GET '/favourites/'`

## OPCIONAL

- **Crear un entrenamiento**
  - `POST '/workouts'`
- **Eliminar un entrenamiento**
  - `DELETE '/workouts/:id'`
- **Añadir un ejercicio a un entrenamiento**
  - `POST '/workouts/:workoutId/exercises/:exerciseId'`
- **Eliminar un ejercicio de un entrenamiento**
  - `DELETE '/workouts/:workoutId/exercises/:exerciseId'`
- **Listado de entrenamientos**
  - `GET '/workouts'`
- **Detalle de un entrenamiento**
  - `GET '/workouts/:id'`
- **Detalle de un ejercicio en un entrenamiento o desde el listado**
  - `GET '/workouts/:workoutId/exercises/:exerciseId'`
