// import path from "path";
// import crypto from "crypto";
// import { PUBLIC_DIR } from "../constants.js";
// import { SERVER_HOST } from "../constants.js";

// export async function UploadFiles(photo, address) {

//     const fileExtension = path.extname(photo.name);
//     const randomFileName = crypto.randomUUID();
//     const newFilePath = `${randomFileName}${fileExtension}`;
//     const PHOTOS_DIR = path.join(PUBLIC_DIR, `${address}`);
//     await photo.mv(path.join(PHOTOS_DIR, newFilePath));

//     const URL = `${SERVER_HOST}/${address}/${newFilePath}`;
//     return URL;
// }

import path from "path";
import crypto from "crypto";
import { PUBLIC_DIR } from "../constants.js";
import { SERVER_HOST } from "../constants.js";

export async function UploadFiles(photo, address, url_old) {

    const fileExtension = path.extname(photo.name);
    let randomFileName;
    if (url_old) {
        let position_address = url_old.split("/");
        const randomFileName1 = position_address[position_address.length - 1];
        randomFileName = randomFileName1.slice(0, -fileExtension.length);
    } else {
        randomFileName = crypto.randomUUID();
    }
    const newFilePath = `${randomFileName}${fileExtension}`;

    const PHOTOS_DIR = path.join(PUBLIC_DIR, `${address}`);
    await photo.mv(path.join(PHOTOS_DIR, newFilePath));


  const URL = `${SERVER_HOST}/${address}/${newFilePath}`;
  return URL;
}
