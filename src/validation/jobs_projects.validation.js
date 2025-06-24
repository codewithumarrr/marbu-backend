// src/validation/jobs_projects.validation.js

const Joi = require('joi');

const createJobProjectSchema = Joi.object({
  job_name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(2).max(200).required(),
  site_id: Joi.number().integer().required()
});

const updateJobProjectSchema = Joi.object({
  job_name: Joi.string().min(2).max(100),
  description: Joi.string().min(2).max(200),
  site_id: Joi.number().integer()
});

module.exports = {
  createJobProjectSchema,
  updateJobProjectSchema
};