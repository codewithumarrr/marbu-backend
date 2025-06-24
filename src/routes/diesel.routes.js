const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { validate,
  createSiteValidation,
  createTankValidation,
  createVehicleValidation,
  createDieselReceivingValidation,
  createDieselConsumptionValidation,
  dateRangeValidation
} = require('../middleware/validate');
const {
  createDieselReceiving,
  getDieselReceivings,
  getDieselReceiving,
  createDieselConsumption,
  getDieselConsumptions,
  getDieselConsumption,
  getDieselStats,
  createVehicle,
  getVehicles,
  createSite,
  getSites,
  createTank,
  getTanks
} = require('../controllers/diesel.controller');

const router = express.Router();

// Protect all routes
router.use(protect);

// Sites
router.post('/sites', 
  restrictTo('ADMIN', 'SITE_MANAGER'),
  validate(createSiteValidation),
  createSite
);
router.get('/sites', getSites);

// Tanks
router.post('/tanks',
  restrictTo('ADMIN', 'SITE_MANAGER'),
  validate(createTankValidation),
  createTank
);
router.get('/tanks', getTanks);

// Vehicles
router.post('/vehicles',
  restrictTo('ADMIN', 'SITE_MANAGER'),
  validate(createVehicleValidation),
  createVehicle
);
router.get('/vehicles', getVehicles);

// Diesel Receiving
router.post('/receiving',
  restrictTo('ADMIN', 'SITE_MANAGER', 'STORE_KEEPER'),
  validate(createDieselReceivingValidation),
  createDieselReceiving
);
router.get('/receiving',
  validate(dateRangeValidation),
  getDieselReceivings
);
router.get('/receiving/:id', getDieselReceiving);

// Diesel Consumption
router.post('/consumption',
  restrictTo('ADMIN', 'SITE_MANAGER', 'OPERATOR'),
  validate(createDieselConsumptionValidation),
  createDieselConsumption
);
router.get('/consumption',
  validate(dateRangeValidation),
  getDieselConsumptions
);
router.get('/consumption/:id', getDieselConsumption);

// Statistics
router.get('/stats',
  restrictTo('ADMIN', 'SITE_MANAGER'),
  validate(dateRangeValidation),
  getDieselStats
);

module.exports = router;