const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_ACCESS_EXPIRES_IN } = require("../config/env");

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Backward-compatible alias used by existing imports.
const signToken = signAccessToken;

module.exports = { signAccessToken, signToken, verifyToken };
