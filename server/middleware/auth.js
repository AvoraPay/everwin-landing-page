import { verifyAccessToken } from "../security.js";
import { mapUserRow, one } from "../db.js";

function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export async function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: "Missing access token." });
  }

  try {
    const payload = verifyAccessToken(token);
    const row = await one("SELECT * FROM users WHERE id = $1", [payload.sub]);
    if (!row) return res.status(401).json({ message: "User not found." });
    if (!["active", "invited"].includes(row.status)) return res.status(403).json({ message: "User blocked." });

    req.authUser = mapUserRow(row);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid access token." });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.authUser) return res.status(401).json({ message: "Unauthorized." });
    if (req.authUser.role !== role) return res.status(403).json({ message: "Forbidden." });
    return next();
  };
}
