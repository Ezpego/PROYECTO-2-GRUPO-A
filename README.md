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

prueba

# ENDPOINTS


USUARIOS ANÓNIMOS

<!--

REGISTRO DE UN USUARIO NUEVO

* POST '/users/register' *

VALIDACIÓN DE EMAIL

* PUT '/users/validate' *

 -->

USUARIOS REGISTRADOS ( ADMINISTRADOR )

<!-- REGISTRO DE UN NUEVO EJERCICIO

* POST '/exercises' *

DEVUELVE INFO DE UN EJERCICIO CONCRETO

* GET '/exercises/:id' *

MODIFICAR EJERCICIO(NAME.DESCRIPTION,LEVEL?,TYPOLOGY,MUSCLE GROUP)

* PUT '/exercises/:id'*

ELIMINAR EJERCICIO

* DELETE '/exercises/:id'*

ELIMINAR USUARIO ???

* DELETE  '/users/:id * -->




USUARIOS REGISTRADOS ( NO ADMINISTRADOR )

# OLVIDO DE CONTRASEÑA

<!--
Enviaremos un email con ese post para que nos envien un email de recuperacion.

* POST '/users/password/recover' *

Una vez recibimos el email de recuperacion, hacemos click en un enlace que nos lleva a la ruta donde introduciremos nuestra nueva password.

 * PUT '/users/newPassword *

-->

# LOGEARTE

<!--

INICIAR SESION

* POST '/users/login' *

PAGINA INICIO

Devolvemos al usuario registrado su pagina principal mostrandole... ?

* GET '/users/:userId *

-->

# EDICIÓN DE PERFIL

<!--

El usuario puede añadir sus datos personales adicionales (FALTA CREAR TABLA ADICIONAL A USERS) a su perfil.

* POST '/user/:userId/editProfile *

El usuario puede cambiar sus datos personales adicionales

* PUT '/user/:userId/editProfile *


 -->

# PAGINA PRINCIPAL, BUSQUEDA DE EJERCICIOS

<!--

El usuario puede solicitar que le mostremos los ejercicios publicados.

Serviría este mismo endpoint para realizar busquedas?
Busqueda por palabra clave (incluida), tipologia y grupo muscular

* GET '/exercises' *


El usuario puede dar o quitar like a un ejercicio

* POST '/exercises/:id/like' *



El usuario puede añadir a favoritos un ejercicio

* POST '/exercises/:id/favourites' *

El usuario puede elminar de sus favoritos un ejercicio

* DELETE '/exercises/:id/favourites' *



El usuario puede crear un entrenamiento

* 

El usuario puede eliminar un entrenamiento

*

El usuario puede añadir un ejercicio a un entrenamiento

*

El usuario puede eliminar un ejercicio de un entrenamiento

*

El usuario puede acceder al listado de entrenamientos

*

El usuario puede acceder al entrenamiento concreto de ese listado

*

El usuario puede acceder al ejercicio concreto de un entrenamiento o un ejercicio del listado

*




 -->


# FILTRO


<!-- 

El usuario puede acceder al listado de tipologia

*

El usuario puede acceder al listado de grupos musculares

*



 -->

# PAGINA PRINCIPAL, MOSTRAR FAVORITOS

 <!-- 
 
 El usuario puede veer lista de favoritos

 * GET '/favourites/:id'
 
  -->



# INSTALAR PRETTIER Y ESLINT COMO EXTENSIONES DE VSCODE

<!-- EN LA CARPETA DEL PROYECTO INSTALAR : -->

npm install -D eslint prettier

<!-- CONFIGURAR ESLINT ESCRIBIENDO EN LA CONSOLA : -->

npx eslint --init

<!-- SI PREGUNTA POR INSTALAR UN PAQUETE "@eslint/create-config@..." -->

le damos a sí (Y)

<!-- RESPONDEMOS A LAS SIGUIENTES PREGUNTAS DE CONFIGURACION : -->

√ How would you like to use ESLint? · LA OPCION DEL MEDIO
√ What type of modules does your project use? · esm
√ Which framework does your project use? · none
√ Does your project use TypeScript? · No / Yes
√ Where does your code run? · node (HAY QUE DESHABILITAR LA OPCION PRIMERA PULSANDO ESPACIO Y HABILITANDO NODE DEL MISMO MODO)
√ What format do you want your config file to be in? · JSON

<!-- HAY QUE ESCRIBIR LA SIGUIENTE LINEA EN EL ARCHIVO .eslintrc.json dentro de RULES, DE TAL MODO QUE QUEDE ASI: -->

"rules": {
        "no-unused-vars": ["error", {"argsIgnorePatterns": "next" }]
    }

<!-- CREAMOS UN ARCHIVO .prettierrc.json EN LA CARPETA DEL PROYECTO (EN CASO DE QUE TANTO ESLINTRC Y PRETTIERRC NO SE SUBAN AL REPO) Y AÑADIR LO SIGUIENTE (ESTO ES A GUSTO DE BERTO, SE PUEDE PERSONALIZAR)-->

{

    "trailingComma": "es5",
    "tabWidth": 2,
    "semi": true,
    "singleQuote": true
}