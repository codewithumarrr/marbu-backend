// src/routes/diesel_consumption.routes.js

const express = require('express');
const joiValidate = require('../middleware/joiValidate');
const { createDieselConsumptionSchema, updateDieselConsumptionSchema } = require('../validation/diesel_consumption.validation');
const {
  createDieselConsumption,
  getAllDieselConsumption,
  getDieselConsumptionById,
  updateDieselConsumption,
  deleteDieselConsumption
} = require('../controllers/diesel_consumption.controller');

const router = express.Router();

router.post('/', joiValidate(createDieselConsumptionSchema), createDieselConsumption);
router.get('/', getAllDieselConsumption);
router.get('/:id', getDieselConsumptionById);
router.put('/:id', joiValidate(updateDieselConsumptionSchema), updateDieselConsumption);
router.delete('/:id', deleteDieselConsumption);

module.exports = router;