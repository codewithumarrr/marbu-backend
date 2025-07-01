// src/services/auth.service.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const signToken = (user_id, employee_id) => {
  return jwt.sign({ user_id, employee_id }, process.env.JWT_SECRET, { expiresIn: '500m' });
};

const signRefreshToken = (user_id, employee_id) => {
  return jwt.sign({ user_id, employee_id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

async function findUserByEmployeeNumber(employee_number) {
  return prisma.users.findUnique({
    where: { employee_number },
    select: { // Select scalar fields directly
      user_id: true,
      employee_number: true,
      qatar_id_number: true,
      profession: true,
      password_hash: true,
      employee_name: true,
      mobile_number: true,
      user_picture: true,
      role_id: true,
      site_id: true,
      roles: {
        select: {
          role_name: true,
          role_id: true
        }
      },
      sites: {
        select: {
          site_name: true,
          site_id: true,
          tanks: {
            select: {
              tank_id: true,
              tank_name: true,
              capacity_liters: true
            }
          }
        }
      }
    }
  });
}

async function findUserById(employee_id) {
  return prisma.users.findUnique({
    where: { employee_id },
    select: {
      user_id: true,
      employee_number: true,
      qatar_id_number: true,
      profession: true,
      password_hash: true,
      employee_name: true,
      mobile_number: true,
      user_picture: true,
      role_id: true,
      site_id: true,
      roles: {
        select: {
          role_name: true,
          role_id: true
        }
      },
      sites: {
        select: {
          site_name: true,
          site_id: true,
          tanks: {
            select: {
              tank_id: true,
              tank_name: true,
              capacity_liters: true
            }
          }
        }
      }
    }
  });
}

async function createUser(data) {
  data.password_hash = await bcrypt.hash(data.password, 12);
  delete data.password;
  // Ensure required fields are present
  const safeData = {
    ...data,
    qatar_id_number: data.qatar_id_number !== undefined ? data.qatar_id_number : "",
    profession: data.profession !== undefined ? data.profession : "",
    site_id: data.site_id ? parseInt(data.site_id) : null,
  };
  const created = await prisma.users.create({
    data: safeData,
    select: {
      user_id: true,
      employee_number: true,
      qatar_id_number: true,
      profession: true,
      employee_name: true,
      mobile_number: true,
      site_id: true,
      user_picture: true,
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
  comparePassword
};

// WebAuthn related functions can be added here if needed
