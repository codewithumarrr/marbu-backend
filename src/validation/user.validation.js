// src/validation/user.validation.js

const Joi = require('joi');

const createUserSchema = Joi.object({
  employee_number: Joi.string().required(),
  employee_name: Joi.string().required(),
  mobile_number: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role_id: Joi.number().integer().required(),
  site_id: Joi.number().integer().required()
});

const updateUserSchema = Joi.object({
  employee_number: Joi.string(),
  employee_name: Joi.string(),
  mobile_number: Joi.string(),
  password: Joi.string().min(6),
  role_id: Joi.number().integer(),
  site_id: Joi.number().integer()
});

module.exports = {
  createUserSchema,
  updateUserSchema
};
