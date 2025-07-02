// src/controllers/divisions.controller.js

const prisma = require('../config/database');

// Get all divisions
exports.getAllDivisions = async (req, res, next) => {
  try {
    const divisions = await prisma.divisions.findMany({
      orderBy: { division_name: 'asc' }
    });
    res.json({ status: 'success', data: divisions });
  } catch (error) {
    next(error);
  }
};

// Create division
exports.createDivision = async (req, res, next) => {
  try {
    const { division_name, description } = req.body;
    const division = await prisma.divisions.create({
      data: { division_name, description }
    });
    res.status(201).json({ status: 'success', data: division });
  } catch (error) {
    next(error);
  }
};

// Update division
exports.updateDivision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { division_name, description } = req.body;
    const division = await prisma.divisions.update({
      where: { division_id: parseInt(id) },
      data: { division_name, description }
    });
    res.json({ status: 'success', data: division });
  } catch (error) {
    next(error);
  }
};

// Delete division
exports.deleteDivision = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.divisions.delete({
      where: { division_id: parseInt(id) }
    });
    res.json({ status: 'success', message: 'Division deleted' });
  } catch (error) {
    next(error);
  }
};