// src/routes/diesel_receiving.routes.js

const express = require('express');
const {
  createDieselReceiving,
  getAllDieselReceiving,
  getDieselReceivingById,
  updateDieselReceiving,
  deleteDieselReceiving
} = require('../controllers/diesel_receiving.controller');

const router = express.Router();

router.post('/', createDieselReceiving);
router.get('/', getAllDieselReceiving);
router.get('/:id', getDieselReceivingById);
router.put('/:id', updateDieselReceiving);
router.delete('/:id', deleteDieselReceiving);

module.exports = router;