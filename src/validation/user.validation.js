// src/validation/user.validation.js

const Joi = require('joi');

const createUserSchema = Joi.object({
  employeeNumber: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().required(),
  site_id: Joi.number().integer().required()
});

const updateUserSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string(),
  site_id: Joi.number().integer()
});

module.exports = {
  createUserSchema,
  updateUserSchema
};