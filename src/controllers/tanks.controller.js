// src/controllers/tanks.controller.js

const prisma = require('../config/database');

// Create a new tank
exports.createTank = async (req, res, next) => {
  try {
    const tank = await prisma.tanks.create({
      data: req.body,
    });
    res.status(201).json(tank);
  } catch (error) {
    next(error);
  }
};

// Get all tanks
exports.getAllTanks = async (req, res, next) => {
  try {
    const tanks = await prisma.tanks.findMany();
    res.json(tanks);
  } catch (error) {
    next(error);
  }
};

// Get tank by ID
exports.getTankById = async (req, res, next) => {
  try {
    const tank = await prisma.tanks.findUnique({
      where: { tank_id: parseInt(req.params.id) },
    });
    if (!tank) return res.status(404).json({ message: 'Tank not found' });
    res.json(tank);
  } catch (error) {
    next(error);
  }
};

// Update tank by ID
exports.updateTank = async (req, res, next) => {
  try {
    const tank = await prisma.tanks.update({
      where: { tank_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(tank);
  } catch (error) {
    next(error);
  }
};

// Delete tank by ID
exports.deleteTank = async (req, res, next) => {
  try {
    await prisma.tanks.delete({
      where: { tank_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};