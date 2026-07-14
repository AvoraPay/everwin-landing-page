import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload) {
  return jwt.sign(payload, config.accessTokenSecret, { expiresIn: config.accessTokenTtl });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, config.refreshTokenSecret, { expiresIn: config.refreshTokenTtl });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.accessTokenSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.refreshTokenSecret);
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function deriveKey() {
  return crypto.scryptSync(config.dataSecret, "everwin-prop-salt", 32);
}

export function encryptSecret(plain) {
  const iv = crypto.randomBytes(12);
  const key = deriveKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptSecret(token) {
  if (!token) return "";
  const raw = Buffer.from(token, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const key = deriveKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
