import express from 'express';
import api from "./api.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.static('public'));

app.use('/api', api);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
