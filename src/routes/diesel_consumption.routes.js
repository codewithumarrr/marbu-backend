// src/routes/diesel_consumption.routes.js

const express = require('express');
const {
  createDieselConsumption,
  getAllDieselConsumption,
  getDieselConsumptionById,
  updateDieselConsumption,
  deleteDieselConsumption
} = require('../controllers/diesel_consumption.controller');

const router = express.Router();

router.post('/', createDieselConsumption);
router.get('/', getAllDieselConsumption);
router.get('/:id', getDieselConsumptionById);
router.put('/:id', updateDieselConsumption);
router.delete('/:id', deleteDieselConsumption);

module.exports = router;