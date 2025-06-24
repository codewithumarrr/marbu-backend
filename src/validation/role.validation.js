// src/validation/role.validation.js

const Joi = require('joi');

const createRoleSchema = Joi.object({
  role_name: Joi.string().min(2).max(50).required(),
  description: Joi.string().min(2).max(200).required()
});

const updateRoleSchema = Joi.object({
  role_name: Joi.string().min(2).max(50),
  description: Joi.string().min(2).max(200)
});

module.exports = {
  createRoleSchema,
  updateRoleSchema
};