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

----------------------------------------------------------------------------------------------------------

# PASOS INICIALES

1 EJECUTAR ARCHIVO init-db.js
2 EJECUTAR ARCHIVO seed.js
3 EJECUTAR ARCHIVO app.js

NOTA : DEJAMOS EN EL ARCHIVO .env.example LOS DATOS DE REGISTRO/LOGIN DEL USUARIO ADMINISTRADOR

# ENDPOINTS RUTA USERS

1 Registro de Usuarios

Método: POST
Ruta: /users/register
Descripción: Registra un nuevo usuario en el sistema. Valida y verifica los datos del usuario antes de insertarlos en la base de datos.

2 Inicio de Sesión de Usuarios

Método: POST
Ruta: /users/login
Descripción: Permite que un usuario existente inicie sesión. Verifica las credenciales proporcionadas y emite un token JWT válido por 7 días para autenticación.

3 Reactivación de Contraseña Olvidada

Método: PATCH
Ruta: /users/forgottenPassword
Descripción: Envía un código de reactivación a un usuario para restablecer la contraseña olvidada.

4 Reactivación de Cuenta

Método: PATCH
Ruta: /users/reactivate_account
Descripción: Permite reactivar una cuenta de usuario desactivada. Verifica el código de reactivación proporcionado y actualiza la contraseña de la cuenta.

5 Edición de Perfil de Usuario

Método: PATCH
Ruta: /user/:userId/editProfile
Descripción: Permite que un usuario edite su propio perfil. Los campos editables incluyen nombre, apellido, DNI, fecha de nacimiento (aaaa/mm/dd), correo electrónico, número de teléfono, contraseña y foto de perfil.

6 Deshabilitar Perfil de Usuario Propio

Método: PATCH
Ruta: /user/:userId/disableProfile
Descripción: Deshabilita el perfil del propio usuario, estableciendo isEnabled en false en la base de datos.

7 Eliminación Física de Perfil de Usuario (Solo Administradores)

Método: DELETE
Ruta: /user/:userId/deleteProfile
Descripción: Elimina físicamente el perfil de un usuario. Solo accesible para usuarios con rol de administrador.

# ENDPOINTS RUTA EXERCISES

1 Crear un Ejercicio

Método: POST
Ruta: /exercises
Descripción: Permite a un usuario administrador crear un nuevo ejercicio. Requiere nombre, descripción, nivel de dificultad, imagen, tipología y grupo muscular.

2 Modificar un Ejercicio

Método: PATCH
Ruta: /exercises/:id
Descripción: Permite a un usuario administrador modificar un ejercicio existente según su ID. Actualiza campos como nombre, descripción, nivel de dificultad, imagen, tipología y grupo muscular.

3 Eliminar un Ejercicio

Método: DELETE
Ruta: /exercises/:id
Descripción: Permite a un usuario administrador eliminar un ejercicio existente según su ID.

# ENDPOINTS RUTA FILTERS

1 Obtener Ejercicios (con filtros opcionales)

Método: GET
Ruta: /exercises/
Descripción: Permite obtener ejercicios según filtros opcionales como grupo muscular, tipología y gustos del cliente. Si no se proporcionan filtros, devuelve todos los ejercicios ordenados por fecha de creación descendente.

2 Obtener Detalles de un Ejercicio

Método: GET
Ruta: /exercises/:id
Descripción: Obtiene detalles específicos de un ejercicio según su ID, asegurando que exista en la base de datos.

3 Gestionar "Me Gusta" en un Ejercicio

Método: POST
Ruta: /exercises/:id/likes
Descripción: Permite a un usuario dar "Me Gusta" o eliminar el "Me Gusta" en un ejercicio específico.

4 Gestionar Ejercicios Favoritos

Método: POST
Ruta: /exercises/:id/favourites
Descripción: Permite a un usuario agregar o eliminar un ejercicio de sus favoritos.

5 Obtener Valores para el Filtro Frontend

Método: GET
Ruta: /filter
Descripción: Obtiene los valores necesarios para los filtros en el frontend, incluyendo grupos musculares, tipologías, likes, y niveles de dificultad.

6 Obtener Ejercicios Favoritos de un Usuario

Método: GET
Ruta: /favourites
Descripción: Permite a un usuario obtener una lista de sus ejercicios favoritos.