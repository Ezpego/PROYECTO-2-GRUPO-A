import "dotenv/config.js";
import express from "express";
import { PORT, SERVER_HOST } from "./constants.js";

const app = express();

app.listen(PORT, () => {
    console.log(SERVER_HOST);
  });
