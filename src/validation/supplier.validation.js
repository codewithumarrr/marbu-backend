// src/validation/supplier.validation.js

const Joi = require('joi');

const createSupplierSchema = Joi.object({
  supplier_name: Joi.string().min(2).max(100).required(),
  contact_number: Joi.string().min(7).max(20).required(),
  address: Joi.string().min(2).max(200).required()
});

const updateSupplierSchema = Joi.object({
  supplier_name: Joi.string().min(2).max(100),
  contact_number: Joi.string().min(7).max(20),
  address: Joi.string().min(2).max(200)
});

module.exports = {
  createSupplierSchema,
  updateSupplierSchema
};