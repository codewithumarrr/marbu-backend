// src/routes/invoices.routes.js

const express = require('express');
const joiValidate = require('../middleware/joiValidate');
const { createInvoiceSchema, updateInvoiceSchema } = require('../validation/invoice.validation');
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getFilteredInvoices,
  generateInvoiceFromConsumption
} = require('../controllers/invoices.controller');

const router = express.Router();

// Frontend specific endpoints
router.get('/filtered', getFilteredInvoices);
router.post('/generate-from-consumption', generateInvoiceFromConsumption);

// Standard CRUD endpoints
router.post('/', joiValidate(createInvoiceSchema), createInvoice);
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', joiValidate(updateInvoiceSchema), updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;
