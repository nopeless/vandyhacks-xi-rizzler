
import { createConnection } from "mongoose";

const { DB_USER, DB_PASS, DB_HOST } = process.env;

if (!DB_USER || !DB_PASS || !DB_HOST) throw new Error("Missing DB_USER or DB_PASS or DB_HOST");

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}`;

const clientOptions = { serverApi: { version: "1", strict: true, deprecationErrors: true } };

export const connection = createConnection(uri, clientOptions);
