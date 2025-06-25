// src/routes/reports.routes.js

const express = require('express');
const {
  generateFuelUsageReport,
  getSitesForReports,
  getVehicleTypesForReports,
  exportReportData,
  getFuelEfficiencyAnalysis,
  exportReportPdf,
  emailReport
} = require('../controllers/reports.controller');

const router = express.Router();

// Reports endpoints
router.get('/fuel-usage', generateFuelUsageReport);
router.get('/sites', getSitesForReports);
router.get('/vehicle-types', getVehicleTypesForReports);
router.get('/export', exportReportData);
router.get('/efficiency-analysis', getFuelEfficiencyAnalysis);
router.get('/export-pdf', exportReportPdf);
router.post('/email-report', emailReport);

module.exports = router;
