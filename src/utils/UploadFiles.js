import path from "path";
import fileUpload from "express-fileupload";
import crypto from "crypto";
import { PUBLIC_DIR } from "../constants.js";
import { SERVER_HOST } from "../constants.js";

export async function UploadFiles(photo, address) {
    const fileExtension = path.extname(photo.name);
    const randomFileName = crypto.randomUUID();
    const newFilePath = `${randomFileName}${fileExtension}`;
    const PHOTOS_DIR = path.join(PUBLIC_DIR, `${address}`);
    await photo.mv(path.join(PHOTOS_DIR, newFilePath));

    const URL = `${SERVER_HOST}/${address}/${newFilePath}`;
    return URL;
}
