import express from "express";
import cookieParser from "cookie-parser";

import api from "./api-route.js";
import { existsSync } from "node:fs";

const app = express();

// sanity check
if (!existsSync("public")) {
  console.error("public directory does not exist. probably wrong cwd");
  exit(1);
}

// for authentication/authorization
app.use(cookieParser());
// json request parsing
app.use(express.json());
// for forms
app.use(express.urlencoded({ extended: true }));

app.use("/api", api);

app.use("/", express.static("public", {
  redirect: false,
  fallthrough: true,
  extensions: ["html"],
  maxAge: 1,
}));

app.use("/", (req, res) => {
  res.sendFile("public/404.html", { root: "." });
});

export default app;
