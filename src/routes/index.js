const express = require('express');
const authRoutes = require('./auth.routes');
const vehicleRoutes = require('./vehicle.routes');
const dieselRoutes = require('./diesel.routes');
const usersRoutes = require('./users.routes');

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/diesel', dieselRoutes);
router.use('/users', usersRoutes);
router.use('/roles', require('./roles.routes'));
router.use('/sites', require('./sites.routes'));
router.use('/tanks', require('./tanks.routes'));
router.use('/suppliers', require('./suppliers.routes'));
router.use('/vehicles-equipment', require('./vehicles_equipment.routes'));
router.use('/jobs-projects', require('./jobs_projects.routes'));
router.use('/diesel-receiving', require('./diesel_receiving.routes'));
router.use('/diesel-consumption', require('./diesel_consumption.routes'));
router.use('/invoices', require('./invoices.routes'));
router.use('/invoice-items', require('./invoice_items.routes'));
router.use('/audit-log', require('./audit_log.routes'));

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Fleet Management API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;