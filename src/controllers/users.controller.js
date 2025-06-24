// src/controllers/users.controller.js

const prisma = require('../config/database');

// Create a new user
exports.createUser = async (req, res, next) => {
  try {
    const user = await prisma.users.create({
      data: req.body,
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { employee_id: parseInt(req.params.id) },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update user by ID
exports.updateUser = async (req, res, next) => {
  try {
    const user = await prisma.users.update({
      where: { employee_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Delete user by ID
exports.deleteUser = async (req, res, next) => {
  try {
    await prisma.users.delete({
      where: { employee_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};