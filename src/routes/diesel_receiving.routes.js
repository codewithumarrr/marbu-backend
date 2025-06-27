// src/routes/diesel_receiving.routes.js

const express = require('express');
const { protect } = require('../middleware/auth');
const {
  generateInvoiceFromReceiving,
  createFuelReceiving,
  getAllDieselReceiving,
  getDieselReceivingById,
  updateDieselReceiving,
  deleteDieselReceiving,
  getNextReceiptNumber,
  getTanksBySite,
  getTankInchargeEmployees,
  getActiveSuppliers
} = require('../controllers/diesel_receiving.controller');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Frontend specific endpoints
router.get('/next-receipt-number', getNextReceiptNumber);
router.get('/tanks/:siteId?', getTanksBySite);
router.get('/employees/tank-incharge', getTankInchargeEmployees);
router.get('/suppliers/active', getActiveSuppliers);
router.post('/create', createFuelReceiving);

router.post('/generate-invoice', generateInvoiceFromReceiving);

// Standard CRUD endpoints
router.get('/', getAllDieselReceiving);
router.get('/:id', getDieselReceivingById);
router.put('/:id', updateDieselReceiving);
router.delete('/:id', deleteDieselReceiving);

module.exports = router;
