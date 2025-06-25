// src/routes/dashboard.routes.js

const express = require('express');
const {
  getDashboardStats,
  getRecentActivity,
  getFuelAlerts,
  getTankStockLevels
} = require('../controllers/dashboard.controller');

const router = express.Router();

// Dashboard endpoints
router.get('/stats', getDashboardStats);
router.get('/recent-activity', getRecentActivity);
router.get('/alerts', getFuelAlerts);
router.get('/tank-stock-levels', getTankStockLevels);

module.exports = router;
