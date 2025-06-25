// src/routes/tanks.routes.js

const express = require('express');
const joiValidate = require('../middleware/joiValidate');
const { createTankSchema, updateTankSchema } = require('../validation/tank.validation');
const { requireRole } = require('../utils/roleUtils');
const { protect } = require('../middleware/auth');
const {
  createTank,
  getAllTanks,
  getTankById,
  updateTank,
  deleteTank
} = require('../controllers/tanks.controller');

const router = express.Router();

router.use(protect, requireRole('admin', 'site-incharge'));

router.post('/', joiValidate(createTankSchema), createTank);
router.get('/', getAllTanks);
router.get('/:id', getTankById);
router.put('/:id', joiValidate(updateTankSchema), updateTank);
router.delete('/:id', deleteTank);

module.exports = router;