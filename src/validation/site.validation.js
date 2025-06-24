// src/validation/site.validation.js

const Joi = require('joi');

const createSiteSchema = Joi.object({
  site_name: Joi.string().min(2).max(100).required(),
  location: Joi.string().min(2).max(100).required()
});

const updateSiteSchema = Joi.object({
  site_name: Joi.string().min(2).max(100),
  location: Joi.string().min(2).max(100)
});

module.exports = {
  createSiteSchema,
  updateSiteSchema
};