// src/validation/invoice_items.validation.js

const Joi = require('joi');

const createInvoiceItemSchema = Joi.object({
  invoice_id: Joi.number().integer().required(),
  description: Joi.string().min(2).max(200).required(),
  quantity: Joi.number().min(1).required(),
  unit_price: Joi.number().min(0).required()
});

const updateInvoiceItemSchema = Joi.object({
  description: Joi.string().min(2).max(200),
  quantity: Joi.number().min(1),
  unit_price: Joi.number().min(0)
});

module.exports = {
  createInvoiceItemSchema,
  updateInvoiceItemSchema
};