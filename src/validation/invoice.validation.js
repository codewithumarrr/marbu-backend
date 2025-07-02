// src/validation/invoice.validation.js

const Joi = require('joi');

const createInvoiceSchema = Joi.object({
  // invoice_number is auto-generated, not required from client
  invoice_date: Joi.date().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  site_id: Joi.number().integer().required(),
  total_amount: Joi.number().min(0).required(),
  generated_by_user_id: Joi.string().required()
});

const updateInvoiceSchema = Joi.object({
  invoice_date: Joi.date(),
  start_date: Joi.date(),
  end_date: Joi.date(),
  site_id: Joi.number().integer(),
  total_amount: Joi.number().min(0),
  generated_by_user_id: Joi.string()
});

module.exports = {
  createInvoiceSchema,
  updateInvoiceSchema
};