// src/routes/audit_log.routes.js

const express = require('express');
const {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
  updateAuditLog,
  deleteAuditLog,
  getFilteredAuditLogs,
  getUsersForAuditFilter,
  getRecordTypesForAuditFilter,
  cleanupDuplicateAuditLogs
} = require('../controllers/audit_log.controller');

const router = express.Router();

// Frontend specific endpoints
router.get('/filtered', getFilteredAuditLogs);
router.get('/users', getUsersForAuditFilter);
router.get('/record-types', getRecordTypesForAuditFilter);

// Admin specific endpoints
router.post('/cleanup-duplicates', cleanupDuplicateAuditLogs);

// Standard CRUD endpoints
router.post('/', createAuditLog);
router.get('/', getAllAuditLogs);
router.get('/:id', getAuditLogById);
router.put('/:id', updateAuditLog);
router.delete('/:id', deleteAuditLog);

module.exports = router;
