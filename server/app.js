import express from "express";
import api from "./api.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

// for authentication/authorization
app.use(express.cookieParser());
// json request parsing
app.use(express.json());
// for forms
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use("/api", api);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
