// src/controllers/diesel_receiving.controller.js

const prisma = require('../config/database');

// Create a new diesel receiving record
exports.createDieselReceiving = async (req, res, next) => {
  try {
    const dieselReceiving = await prisma.diesel_receiving.create({
      data: req.body,
    });
    res.status(201).json(dieselReceiving);
  } catch (error) {
    next(error);
  }
};

// Get all diesel receiving records
exports.getAllDieselReceiving = async (req, res, next) => {
  try {
    const dieselReceiving = await prisma.diesel_receiving.findMany();
    res.json(dieselReceiving);
  } catch (error) {
    next(error);
  }
};

// Get diesel receiving record by ID
exports.getDieselReceivingById = async (req, res, next) => {
  try {
    const dieselReceiving = await prisma.diesel_receiving.findUnique({
      where: { receiving_id: parseInt(req.params.id) },
    });
    if (!dieselReceiving) return res.status(404).json({ message: 'Diesel receiving record not found' });
    res.json(dieselReceiving);
  } catch (error) {
    next(error);
  }
};

// Update diesel receiving record by ID
exports.updateDieselReceiving = async (req, res, next) => {
  try {
    const dieselReceiving = await prisma.diesel_receiving.update({
      where: { receiving_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(dieselReceiving);
  } catch (error) {
    next(error);
  }
};

// Delete diesel receiving record by ID
exports.deleteDieselReceiving = async (req, res, next) => {
  try {
    await prisma.diesel_receiving.delete({
      where: { receiving_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};