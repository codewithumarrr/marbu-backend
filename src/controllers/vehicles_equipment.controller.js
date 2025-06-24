// src/controllers/vehicles_equipment.controller.js

const prisma = require('../config/database');

// Create a new vehicle/equipment
exports.createVehicleEquipment = async (req, res, next) => {
  try {
    const vehicleEquipment = await prisma.vehicles_equipment.create({
      data: req.body,
    });
    res.status(201).json(vehicleEquipment);
  } catch (error) {
    next(error);
  }
};

// Get all vehicles/equipment
exports.getAllVehiclesEquipment = async (req, res, next) => {
  try {
    const vehiclesEquipment = await prisma.vehicles_equipment.findMany();
    res.json(vehiclesEquipment);
  } catch (error) {
    next(error);
  }
};

// Get vehicle/equipment by ID
exports.getVehicleEquipmentById = async (req, res, next) => {
  try {
    const vehicleEquipment = await prisma.vehicles_equipment.findUnique({
      where: { vehicle_equipment_id: parseInt(req.params.id) },
    });
    if (!vehicleEquipment) return res.status(404).json({ message: 'Vehicle/Equipment not found' });
    res.json(vehicleEquipment);
  } catch (error) {
    next(error);
  }
};

// Update vehicle/equipment by ID
exports.updateVehicleEquipment = async (req, res, next) => {
  try {
    const vehicleEquipment = await prisma.vehicles_equipment.update({
      where: { vehicle_equipment_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(vehicleEquipment);
  } catch (error) {
    next(error);
  }
};

// Delete vehicle/equipment by ID
exports.deleteVehicleEquipment = async (req, res, next) => {
  try {
    await prisma.vehicles_equipment.delete({
      where: { vehicle_equipment_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};