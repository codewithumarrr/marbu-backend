const { body } = require('express-validator');
const { validate } = require('./validate');

const createVehicleValidation = [
  body('registrationNumber')
    .notEmpty()
    .withMessage('Registration number is required')
    .isString()
    .withMessage('Registration number must be a string'),
  body('make')
    .notEmpty()
    .withMessage('Make is required'),
  body('model')
    .notEmpty()
    .withMessage('Model is required'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year'),
  body('vehicleTypeId')
    .notEmpty()
    .withMessage('Vehicle type is required')
    .isInt()
    .withMessage('Invalid vehicle type'),
  body('purchaseDate')
    .notEmpty()
    .withMessage('Purchase date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('currentMileage')
    .notEmpty()
    .withMessage('Current mileage is required')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('dailyRentalRate')
    .notEmpty()
    .withMessage('Daily rental rate is required')
    .isFloat({ min: 0 })
    .withMessage('Daily rental rate must be a positive number')
];

const createMaintenanceValidation = [
  body('vehicleId')
    .notEmpty()
    .withMessage('Vehicle ID is required')
    .isInt()
    .withMessage('Invalid vehicle ID'),
  body('maintenanceTypeId')
    .notEmpty()
    .withMessage('Maintenance type is required')
    .isInt()
    .withMessage('Invalid maintenance type'),
  body('maintenanceDate')
    .notEmpty()
    .withMessage('Maintenance date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('mileageAtService')
    .notEmpty()
    .withMessage('Mileage at service is required')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('cost')
    .notEmpty()
    .withMessage('Cost is required')
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('serviceCenter')
    .notEmpty()
    .withMessage('Service center is required'),
  body('nextServiceMileage')
    .notEmpty()
    .withMessage('Next service mileage is required')
    .isInt({ min: 0 })
    .withMessage('Next service mileage must be a positive number'),
  body('nextServiceDate')
    .notEmpty()
    .withMessage('Next service date is required')
    .isISO8601()
    .withMessage('Invalid date format')
];

const createTireValidation = [
  body('vehicleId')
    .notEmpty()
    .withMessage('Vehicle ID is required')
    .isInt()
    .withMessage('Invalid vehicle ID'),
  body('position')
    .notEmpty()
    .withMessage('Tire position is required')
    .isIn(['FL', 'FR', 'RL', 'RR', 'SPARE'])
    .withMessage('Invalid tire position'),
  body('brand')
    .notEmpty()
    .withMessage('Brand is required'),
  body('serialNumber')
    .notEmpty()
    .withMessage('Serial number is required'),
  body('size')
    .notEmpty()
    .withMessage('Tire size is required'),
  body('manufactureDate')
    .notEmpty()
    .withMessage('Manufacture date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('initialTreadDepth')
    .notEmpty()
    .withMessage('Initial tread depth is required')
    .isFloat({ min: 0 })
    .withMessage('Initial tread depth must be a positive number'),
  body('currentTreadDepth')
    .notEmpty()
    .withMessage('Current tread depth is required')
    .isFloat({ min: 0 })
    .withMessage('Current tread depth must be a positive number')
];

const createFuelRecordValidation = [
  body('vehicleId')
    .notEmpty()
    .withMessage('Vehicle ID is required')
    .isInt()
    .withMessage('Invalid vehicle ID'),
  body('fuelDate')
    .notEmpty()
    .withMessage('Fuel date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('mileage')
    .notEmpty()
    .withMessage('Mileage is required')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('liters')
    .notEmpty()
    .withMessage('Liters is required')
    .isFloat({ min: 0 })
    .withMessage('Liters must be a positive number'),
  body('costPerLiter')
    .notEmpty()
    .withMessage('Cost per liter is required')
    .isFloat({ min: 0 })
    .withMessage('Cost per liter must be a positive number'),
  body('stationName')
    .notEmpty()
    .withMessage('Station name is required')
];

const assignVehicleValidation = [
  body('driverId')
    .notEmpty()
    .withMessage('Driver ID is required')
    .isInt()
    .withMessage('Invalid driver ID'),
  body('assignmentDate')
    .notEmpty()
    .withMessage('Assignment date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('expectedReturnDate')
    .notEmpty()
    .withMessage('Expected return date is required')
    .isISO8601()
    .withMessage('Invalid date format')
];

module.exports = {
  createVehicleValidation,
  createMaintenanceValidation,
  createTireValidation,
  createFuelRecordValidation,
  assignVehicleValidation
};