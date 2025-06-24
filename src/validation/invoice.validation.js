// src/validation/invoice.validation.js

const Joi = require('joi');

const createInvoiceSchema = Joi.object({
  invoice_number: Joi.string().min(2).max(50).required(),
  date: Joi.date().required(),
  supplier_id: Joi.number().integer().required(),
  total_amount: Joi.number().min(0).required()
});

const updateInvoiceSchema = Joi.object({
  invoice_number: Joi.string().min(2).max(50),
  date: Joi.date(),
  supplier_id: Joi.number().integer(),
  total_amount: Joi.number().min(0)
});

module.exports = {
  createInvoiceSchema,
  updateInvoiceSchema
};