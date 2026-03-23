// middleware/auth.js
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "somesh_secret";
 
/**
 * Verifies Bearer JWT in Authorization header.
 * Attaches decoded payload to req.user.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
 
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
 
/**
 * Role guard — use after authMiddleware.
 * Usage: router.delete('/x', authMiddleware, requireRole('admin'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}
 
module.exports = { authMiddleware, requireRole };