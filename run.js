import "dotenv/config";

import app from "./server/app.js";

const PORT = process.env.PORT ?? 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${server.address().port}`);
});


