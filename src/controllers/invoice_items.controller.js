// src/controllers/invoice_items.controller.js

const prisma = require('../config/database');

// Create a new invoice item
exports.createInvoiceItem = async (req, res, next) => {
  try {
    const invoiceItem = await prisma.invoice_items.create({
      data: req.body,
    });
    res.status(201).json(invoiceItem);
  } catch (error) {
    next(error);
  }
};

// Get all invoice items
exports.getAllInvoiceItems = async (req, res, next) => {
  try {
    const invoiceItems = await prisma.invoice_items.findMany();
    res.json(invoiceItems);
  } catch (error) {
    next(error);
  }
};

// Get invoice item by ID
exports.getInvoiceItemById = async (req, res, next) => {
  try {
    const invoiceItem = await prisma.invoice_items.findUnique({
      where: { invoice_item_id: parseInt(req.params.id) },
    });
    if (!invoiceItem) return res.status(404).json({ message: 'Invoice item not found' });
    res.json(invoiceItem);
  } catch (error) {
    next(error);
  }
};

// Update invoice item by ID
exports.updateInvoiceItem = async (req, res, next) => {
  try {
    const invoiceItem = await prisma.invoice_items.update({
      where: { invoice_item_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(invoiceItem);
  } catch (error) {
    next(error);
  }
};

// Delete invoice item by ID
exports.deleteInvoiceItem = async (req, res, next) => {
  try {
    await prisma.invoice_items.delete({
      where: { invoice_item_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};