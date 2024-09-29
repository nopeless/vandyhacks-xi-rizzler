import bcrypt from "bcrypt";
import crypto from "node:crypto";

export async function hashPassword(password) {
  if (!password) throw new Error("Password missing");
  const rounds = 10;
  return await bcrypt.hash(password, rounds);
}

export async function validatePassword(password, hash) {
  if (!password || !hash) throw new Error("Invalid argument");
  return await bcrypt.compare(password, hash);
}

export async function generateSid() {
  return crypto.randomBytes(16).toString("hex");
}

export function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

