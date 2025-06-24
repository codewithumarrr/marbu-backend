// src/validation/vehicle.validation.js

const Joi = require('joi');

const createVehicleSchema = Joi.object({
  vehicle_number: Joi.string().min(2).max(50).required(),
  type: Joi.string().min(2).max(50).required(),
  model: Joi.string().min(2).max(50).required(),
  site_id: Joi.number().integer().required()
});

const updateVehicleSchema = Joi.object({
  vehicle_number: Joi.string().min(2).max(50),
  type: Joi.string().min(2).max(50),
  model: Joi.string().min(2).max(50),
  site_id: Joi.number().integer()
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema
};