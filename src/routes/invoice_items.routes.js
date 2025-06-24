// src/routes/invoice_items.routes.js

const express = require('express');
const {
  createInvoiceItem,
  getAllInvoiceItems,
  getInvoiceItemById,
  updateInvoiceItem,
  deleteInvoiceItem
} = require('../controllers/invoice_items.controller');

const router = express.Router();

router.post('/', createInvoiceItem);
router.get('/', getAllInvoiceItems);
router.get('/:id', getInvoiceItemById);
router.put('/:id', updateInvoiceItem);
router.delete('/:id', deleteInvoiceItem);

module.exports = router;