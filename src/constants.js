export const PORT = process.env.PORT || 3000;
export const SERVER_HOST =
    process.env.SERVER_HOST || `http://localhost:${PORT}`;

//-------------------
// Añadido Gabriel
//-------------------

import path from "path";

export const PUBLIC_DIR = path.join(process.cwd(), "public");
// export const PHOTOS_DIR = path.join(PUBLIC_DIR, "photos");
