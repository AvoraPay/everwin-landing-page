import crypto from "node:crypto";
import { customAlphabet } from "nanoid";

const shortId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 12);

export function nowISO() {
  return new Date().toISOString();
}

export function uid(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createShortCode(prefix = "") {
  return `${prefix}${shortId()}`;
}

export function createOtpCode(length = 6) {
  const digits = "0123456789";
  let output = "";
  for (let index = 0; index < length; index += 1) {
    output += digits[Math.floor(Math.random() * digits.length)];
  }
  return output;
}

export function createTempPassword(length = 14) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "@$!%*?&";
  const all = upper + lower + digits + special;

  // Guarantee at least one of each category
  const pick = (s) => s[Math.floor(Math.random() * s.length)];
  const guaranteed = [pick(upper), pick(lower), pick(digits), pick(special)];

  let output = "";
  for (let index = 0; index < length - guaranteed.length; index += 1) {
    output += all[Math.floor(Math.random() * all.length)];
  }

  // Insert guaranteed chars at random positions
  const arr = output.split("");
  for (const ch of guaranteed) {
    arr.splice(Math.floor(Math.random() * (arr.length + 1)), 0, ch);
  }
  return arr.join("");
}

export function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function safeJsonParse(input, fallback = null) {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
}

export function normalizeEmail(value = "") {
  return value.trim().toLowerCase();
}

export function normalizeCpf(value = "") {
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? digits : "";
}

export function normalizeName(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function slugify(value = "") {
  const base = normalizeName(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "client";
}

export function buildPortalEmail(name, domain, suffix = "") {
  const base = slugify(name);
  const local = suffix ? `${base}.${suffix}` : base;
  return `${local}@${domain}`;
}

export function addHours(dateInput, hours) {
  return new Date(new Date(dateInput).getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function addDays(dateInput, days) {
  return new Date(new Date(dateInput).getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}
