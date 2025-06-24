// src/routes/audit_log.routes.js

const express = require('express');
const {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
  updateAuditLog,
  deleteAuditLog
} = require('../controllers/audit_log.controller');

const router = express.Router();

router.post('/', createAuditLog);
router.get('/', getAllAuditLogs);
router.get('/:id', getAuditLogById);
router.put('/:id', updateAuditLog);
router.delete('/:id', deleteAuditLog);

module.exports = router;