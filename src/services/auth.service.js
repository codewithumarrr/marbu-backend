// src/services/auth.service.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const signToken = (employee_id) => {
  return jwt.sign({ employee_id }, process.env.JWT_SECRET, { expiresIn: '500m' });
};

const signRefreshToken = (employee_id) => {
  return jwt.sign({ employee_id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

async function findUserByEmployeeNumber(employee_number) {
  return prisma.users.findUnique({
    where: { employee_number },
    select: {
      employee_id: true,
      employee_number: true,
      password_hash: true,
      role_id: true,
      // add other fields as needed
    }
  });
}

async function findUserById(id) {
  return prisma.users.findUnique({ where: { id } });
}

async function createUser(data) {
  data.password_hash = await bcrypt.hash(data.password, 12);
  delete data.password;
  const created = await prisma.users.create({
    data,
    select: {
      employee_id: true,
      employee_number: true,
      employee_name: true,
      mobile_number: true,
      site_id: true,
      roles: {
        select: {
          role_name: true
        }
      }
    }
  });
  return created;
}

async function comparePassword(raw, hash) {
  return bcrypt.compare(raw, hash);
}

module.exports = {
  signToken,
  signRefreshToken,
  findUserByEmployeeNumber,
  findUserById,
  createUser,
  comparePassword,
};