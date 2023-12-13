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

### USUARIOS REGISTRADOS (ADMINISTRADOR)

- **Registro de un nuevo ejercicio**
  - ~~`POST '/exercises'`~~
- **Modificar ejercicio (Nombre, Descripción, Tipología, Grupo muscular)**
  - ~~`PUT '/exercises/:id'`~~
- **Eliminar ejercicio**
  - ~~`DELETE '/exercises/:id'`~~
  <!-- - **Eliminar Usuario**
  - `DELETE '/users/:id'` -->

