const { validationResult, body, param, query } = require('express-validator');
const { AppError } = require('./errorHandler');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  };
};

// Auth Validations
const registerValidation = [
  body('employeeNumber').notEmpty().withMessage('Employee number is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role').isIn(['ADMIN', 'SITE_MANAGER', 'OPERATOR', 'STORE_KEEPER'])
    .withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Diesel Management Validations
const createSiteValidation = [
  body('name').notEmpty().withMessage('Site name is required'),
  body('location').optional()
];

const createTankValidation = [
  body('name').notEmpty().withMessage('Tank name is required'),
  body('capacity').isFloat({ min: 0 }).withMessage('Capacity must be a positive number'),
  body('siteId').notEmpty().withMessage('Site ID is required')
];

const createVehicleValidation = [
  body('type').notEmpty().withMessage('Vehicle type is required'),
  body('plateNumber')
    .optional()
    .custom((value, { req }) => {
      if (!value && !req.body.machineId) {
        throw new Error('Either plate number or machine ID is required');
      }
      return true;
    }),
  body('machineId').optional(),
  body('model').optional(),
  body('dailyLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Daily limit must be a positive number')
];

const createDieselReceivingValidation = [
  body('tankId').notEmpty().withMessage('Tank Name is required'),
  body('receiptNumber').notEmpty().withMessage('Receipt number is required'),
  body('quantity')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number in Liters'),
  body('plateNo').optional().isString().withMessage('Plate number must be a string'),
  body('siteId').notEmpty().withMessage('Site Location is required'),
  body('receivedById').notEmpty().withMessage('Received By is required')
];

const createDieselConsumptionValidation = [
  body('quantity')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('shift')
    .isIn(['Morning', 'Evening', 'Night'])
    .withMessage('Invalid shift'),
  body('jobNumber').optional(),
  body('odometerReading')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Odometer reading must be a positive number'),
  body('equipmentHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Equipment hours must be a positive number'),
  body('siteId').notEmpty().withMessage('Site ID is required'),
  body('tankId').notEmpty().withMessage('Tank ID is required'),
  body('vehicleId').notEmpty().withMessage('Vehicle ID is required')
];

const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  createSiteValidation,
  createTankValidation,
  createVehicleValidation,
  createDieselReceivingValidation,
  createDieselConsumptionValidation,
  dateRangeValidation
};