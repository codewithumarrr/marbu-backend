// src/routes/vehicles_equipment.routes.js

const express = require('express');
const {
  createVehicleEquipment,
  getAllVehiclesEquipment,
  getVehicleEquipmentById,
  updateVehicleEquipment,
  deleteVehicleEquipment
} = require('../controllers/vehicles_equipment.controller');

const router = express.Router();

router.post('/', createVehicleEquipment);
router.get('/', getAllVehiclesEquipment);
router.get('/:id', getVehicleEquipmentById);
router.put('/:id', updateVehicleEquipment);
router.delete('/:id', deleteVehicleEquipment);

module.exports = router;