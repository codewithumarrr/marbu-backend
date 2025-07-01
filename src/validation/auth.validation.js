// src/validation/auth.validation.js

const Joi = require('joi');

const registerSchema = Joi.object({
  employeeNumber: Joi.string().required(),
  name: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().required(),
  mobile_number: Joi.string().required(),
  site_id: Joi.number().integer().required()
}).unknown(true);

const loginSchema = Joi.object({
  employee_number: Joi.string().required(),
  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema
};