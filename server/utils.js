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

/**
 * The tracking code for a submission.
 *
 * It used to be built from the applicant's document number — for a Brazilian CPF
 * the code WAS the CPF, so anyone holding a CPF could open that person's
 * application page. The code is now unguessable random, and the arguments are
 * kept only so callers do not change: nothing from them reaches the output.
 */
export function createSubmissionCodeFromDocument() {
  return `EW-${randomFrom(CODE_ALPHABET, 5)}-${randomFrom(CODE_ALPHABET, 5)}`;
}

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Uniform, bias-free draw from a real CSPRNG. */
function randomFrom(alphabet, length) {
  let output = "";
  for (let index = 0; index < length; index += 1) {
    output += alphabet[crypto.randomInt(alphabet.length)];
  }
  return output;
}

export function createOtpCode(length = 6) {
  return randomFrom("0123456789", length);
}

export function createTempPassword(length = 14) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "@$!%*?&";
  const all = upper + lower + digits + special;

  // Guarantee at least one of each category
  const guaranteed = [randomFrom(upper, 1), randomFrom(lower, 1), randomFrom(digits, 1), randomFrom(special, 1)];

  const arr = randomFrom(all, Math.max(0, length - guaranteed.length)).split("");
  for (const ch of guaranteed) {
    arr.splice(crypto.randomInt(arr.length + 1), 0, ch);
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
