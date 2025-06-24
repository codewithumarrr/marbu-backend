// src/routes/tanks.routes.js

const express = require('express');
const {
  createTank,
  getAllTanks,
  getTankById,
  updateTank,
  deleteTank
} = require('../controllers/tanks.controller');

const router = express.Router();

router.post('/', createTank);
router.get('/', getAllTanks);
router.get('/:id', getTankById);
router.put('/:id', updateTank);
router.delete('/:id', deleteTank);

module.exports = router;