// src/routes/invoice_items.routes.js

const express = require('express');
const joiValidate = require('../middleware/joiValidate');
const { createInvoiceItemSchema, updateInvoiceItemSchema } = require('../validation/invoice_items.validation');
const {
  createInvoiceItem,
  getAllInvoiceItems,
  getInvoiceItemById,
  updateInvoiceItem,
  deleteInvoiceItem
} = require('../controllers/invoice_items.controller');

const router = express.Router();

router.post('/', joiValidate(createInvoiceItemSchema), createInvoiceItem);
router.get('/', getAllInvoiceItems);
router.get('/:id', getInvoiceItemById);
router.put('/:id', joiValidate(updateInvoiceItemSchema), updateInvoiceItem);
router.delete('/:id', deleteInvoiceItem);

module.exports = router;