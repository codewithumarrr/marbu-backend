// src/controllers/diesel_consumption.controller.js

const prisma = require('../config/database');

// Create a new diesel consumption record
exports.createDieselConsumption = async (req, res, next) => {
  try {
    const dieselConsumption = await prisma.diesel_consumption.create({
      data: req.body,
    });
    res.status(201).json(dieselConsumption);
  } catch (error) {
    next(error);
  }
};

// Get all diesel consumption records
exports.getAllDieselConsumption = async (req, res, next) => {
  try {
    const dieselConsumption = await prisma.diesel_consumption.findMany();
    res.json(dieselConsumption);
  } catch (error) {
    next(error);
  }
};

// Get diesel consumption record by ID
exports.getDieselConsumptionById = async (req, res, next) => {
  try {
    const dieselConsumption = await prisma.diesel_consumption.findUnique({
      where: { consumption_id: parseInt(req.params.id) },
    });
    if (!dieselConsumption) return res.status(404).json({ message: 'Diesel consumption record not found' });
    res.json(dieselConsumption);
  } catch (error) {
    next(error);
  }
};

// Update diesel consumption record by ID
exports.updateDieselConsumption = async (req, res, next) => {
  try {
    const dieselConsumption = await prisma.diesel_consumption.update({
      where: { consumption_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(dieselConsumption);
  } catch (error) {
    next(error);
  }
};

// Delete diesel consumption record by ID
exports.deleteDieselConsumption = async (req, res, next) => {
  try {
    await prisma.diesel_consumption.delete({
      where: { consumption_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};