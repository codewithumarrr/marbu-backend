// src/validation/tank.validation.js

const Joi = require('joi');

const createTankSchema = Joi.object({
  tank_name: Joi.string().min(2).max(100).required(),
  capacity_liters: Joi.number().integer().min(1).required(),
  site_id: Joi.number().integer().required()
});

const updateTankSchema = Joi.object({
  tank_name: Joi.string().min(2).max(100),
  capacity_liters: Joi.number().integer().min(1),
  site_id: Joi.number().integer()
});

module.exports = {
  createTankSchema,
  updateTankSchema
};