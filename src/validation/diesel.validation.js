// src/validation/diesel.validation.js

const Joi = require('joi');

const createDieselSchema = Joi.object({
  tank_id: Joi.number().integer().required(),
  quantity: Joi.number().min(1).required(),
  date: Joi.date().required()
});

const updateDieselSchema = Joi.object({
  tank_id: Joi.number().integer(),
  quantity: Joi.number().min(1),
  date: Joi.date()
});

module.exports = {
  createDieselSchema,
  updateDieselSchema
};