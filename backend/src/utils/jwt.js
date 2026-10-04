const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is missing.");
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      jti: crypto.randomUUID(),
    },

    process.env.JWT_ACCESS_SECRET,

    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "45m",

      issuer: "home-service-api",

      audience: "home-service-mobile",
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET,
    {
      issuer: "home-service-api",
      audience: "home-service-mobile",
    }
  );
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};