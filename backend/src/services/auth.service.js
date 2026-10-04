const { User, RefreshToken } = require("../models");
const { hashPassword, comparePassword } = require("../utils/password");
const { signAccessToken } = require("../utils/jwt");
const { createRefreshToken } = require("../utils/token");

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

const register = async ({ name, email, password, role = "customer" }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    const error = new Error("Email is already registered");
    error.status = 409;
    throw error;
  }

  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password), role });
  return createSession(user);
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }
  return createSession(user);
};

const createSession = async (user) => {
  const refreshToken = createRefreshToken();
  await RefreshToken.create({ userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
  return { user: publicUser(user), accessToken: signAccessToken({ id: user.id, role: user.role }), refreshToken };
};

module.exports = { register, login, publicUser };
