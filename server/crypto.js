import bcrypt from "node:bcrypt";
import crypto from "node:crypto";

export async function hashPassword(password) {
  const rounds = 10;
  return await bcrypt.hash(password, rounds);
}

export async function validatePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export async function generateSid() {
  return crypto.randomBytes(16).toString("hex");
}
