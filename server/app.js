import express from "express";
import cookieParser from "cookie-parser";

import api from "./api-route.js";

const app = express();

// for authentication/authorization
app.use(cookieParser());
// json request parsing
app.use(express.json());
// for forms
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use("/api", api);

export default app;
