const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { validate,
  createVehicleValidation,
  createMaintenanceValidation,
  createTireValidation,
  createFuelRecordValidation
} = require('../middleware/validate');
const {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  createMaintenance,
  getMaintenanceHistory,
  createTire,
  getTires,
  recordFuel,
  getFuelHistory,
  getVehicleStats,
  assignVehicle,
  returnVehicle
} = require('../controllers/vehicle.controller');

const router = express.Router();

// Protect all routes
router.use(protect);

// Vehicle Management
router.post('/vehicles', 
  restrictTo('ADMIN', 'MANAGER'),
  validate(createVehicleValidation),
  createVehicle
);
router.get('/vehicles', getVehicles);
router.get('/vehicles/:id', getVehicle);
router.patch('/vehicles/:id',
  restrictTo('ADMIN', 'MANAGER'),
  validate(createVehicleValidation),
  updateVehicle
);

// Maintenance
router.post('/maintenance',
  restrictTo('ADMIN', 'MANAGER', 'MECHANIC'),
  validate(createMaintenanceValidation),
  createMaintenance
);
router.get('/maintenance/:vehicleId', getMaintenanceHistory);

// Tire Management
router.post('/tires',
  restrictTo('ADMIN', 'MANAGER', 'MECHANIC'),
  validate(createTireValidation),
  createTire
);
router.get('/tires/:vehicleId', getTires);

// Fuel Records
router.post('/fuel',
  restrictTo('ADMIN', 'MANAGER', 'DRIVER'),
  validate(createFuelRecordValidation),
  recordFuel
);
router.get('/fuel/:vehicleId', getFuelHistory);

// Vehicle Assignment
router.post('/assign/:vehicleId',
  restrictTo('ADMIN', 'MANAGER'),
  assignVehicle
);
router.post('/return/:vehicleId',
  restrictTo('ADMIN', 'MANAGER'),
  returnVehicle
);

// Statistics
router.get('/stats',
  restrictTo('ADMIN', 'MANAGER'),
  getVehicleStats
);

module.exports = router;