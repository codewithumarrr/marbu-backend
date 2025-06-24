// src/validation/diesel_consumption.validation.js

const Joi = require('joi');

const createDieselConsumptionSchema = Joi.object({
  vehicle_id: Joi.number().integer().required(),
  quantity: Joi.number().min(1).required(),
  date: Joi.date().required()
});

const updateDieselConsumptionSchema = Joi.object({
  vehicle_id: Joi.number().integer(),
  quantity: Joi.number().min(1),
  date: Joi.date()
});

module.exports = {
  createDieselConsumptionSchema,
  updateDieselConsumptionSchema
};