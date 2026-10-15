import jwt from "jsonwebtoken";

function readToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

// Any signed-in user (customer or admin)
export default function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: "Please sign in." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    req.role = payload.role;
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}

// Admin only
export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.role !== "admin") return res.status(403).json({ message: "Admin access only." });
    next();
  });
}
