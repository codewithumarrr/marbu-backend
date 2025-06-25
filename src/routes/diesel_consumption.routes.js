// src/routes/diesel_consumption.routes.js

const express = require('express');
const joiValidate = require('../middleware/joiValidate');
const { createDieselConsumptionSchema, updateDieselConsumptionSchema } = require('../validation/diesel_consumption.validation');
const {
  createFuelConsumption,
  getAllDieselConsumption,
  getDieselConsumptionById,
  updateDieselConsumption,
  deleteDieselConsumption,
  getVehicleEquipmentTypes,
  getVehiclesByType,
  getActiveJobs,
  getOperatorEmployees,
  saveThumbprint
} = require('../controllers/diesel_consumption.controller');

const router = express.Router();

// Frontend specific endpoints
router.get('/vehicle-types', getVehicleEquipmentTypes);
router.get('/vehicles/:type', getVehiclesByType);
router.get('/jobs/active', getActiveJobs);
router.get('/employees/operators', getOperatorEmployees);
router.post('/thumbprint', saveThumbprint);
router.post('/create', createFuelConsumption);

// Standard CRUD endpoints
router.get('/', getAllDieselConsumption);
router.get('/:id', getDieselConsumptionById);
router.put('/:id', joiValidate(updateDieselConsumptionSchema), updateDieselConsumption);
router.delete('/:id', deleteDieselConsumption);

module.exports = router;
