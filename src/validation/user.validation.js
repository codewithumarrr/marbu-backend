// src/validation/user.validation.js

const Joi = require('joi');

const createUserSchema = Joi.object({
  employee_number: Joi.string().required(),
  qatar_id_number: Joi.string().required(),
  profession: Joi.string().required(),
  employee_name: Joi.string().required(),
  mobile_number: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role_id: Joi.number().integer().required(),
  site_id: Joi.number().integer().allow(null).optional(),
  user_picture: Joi.string().uri().allow(null).optional() // Assuming it's a URL
});

const updateUserSchema = Joi.object({
  employee_number: Joi.string().optional(),
  qatar_id_number: Joi.string().optional(),
  profession: Joi.string().optional(),
  employee_name: Joi.string().optional(),
  mobile_number: Joi.string().optional(),
  password: Joi.string().min(6).optional(),
  role_id: Joi.number().integer().optional(),
  site_id: Joi.number().integer().allow(null).optional(),
  user_picture: Joi.string().uri().allow(null).optional() // Assuming it's a URL
});

module.exports = {
  createUserSchema,
  updateUserSchema
};
