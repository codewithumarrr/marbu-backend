// src/routes/invoices.routes.js

const express = require('express');
const joiValidate = require('../middleware/joiValidate');
const { createInvoiceSchema, updateInvoiceSchema } = require('../validation/invoice.validation');
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoices.controller');

const router = express.Router();

router.post('/', joiValidate(createInvoiceSchema), createInvoice);
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', joiValidate(updateInvoiceSchema), updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;