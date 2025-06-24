// src/controllers/roles.controller.js

const prisma = require('../config/database');

// Create a new role
exports.createRole = async (req, res, next) => {
  try {
    const role = await prisma.roles.create({
      data: req.body,
    });
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
};

// Get all roles
exports.getAllRoles = async (req, res, next) => {
  try {
    const roles = await prisma.roles.findMany();
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

// Get role by ID
exports.getRoleById = async (req, res, next) => {
  try {
    const role = await prisma.roles.findUnique({
      where: { role_id: parseInt(req.params.id) },
    });
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (error) {
    next(error);
  }
};

// Update role by ID
exports.updateRole = async (req, res, next) => {
  try {
    const role = await prisma.roles.update({
      where: { role_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(role);
  } catch (error) {
    next(error);
  }
};

// Delete role by ID
exports.deleteRole = async (req, res, next) => {
  try {
    await prisma.roles.delete({
      where: { role_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};