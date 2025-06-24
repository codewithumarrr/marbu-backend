// src/routes/suppliers.routes.js

const express = require('express');
const joiValidate = require('../middleware/joiValidate');
const { createSupplierSchema, updateSupplierSchema } = require('../validation/supplier.validation');
const { requireRole } = require('../utils/roleUtils');
const { protect } = require('../middleware/auth');
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
} = require('../controllers/suppliers.controller');

const router = express.Router();

router.use(protect, requireRole('admin', 'site-manager'));

router.post('/', joiValidate(createSupplierSchema), createSupplier);
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.put('/:id', joiValidate(updateSupplierSchema), updateSupplier);
router.delete('/:id', deleteSupplier);

module.exports = router;