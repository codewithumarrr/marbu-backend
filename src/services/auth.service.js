// src/services/auth.service.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function createUser(data) {
  data.password = await bcrypt.hash(data.password, 12);
  return prisma.user.create({ data });
}

async function comparePassword(raw, hash) {
  return bcrypt.compare(raw, hash);
}

module.exports = {
  signToken,
  signRefreshToken,
  findUserByEmail,
  findUserById,
  createUser,
  comparePassword,
};