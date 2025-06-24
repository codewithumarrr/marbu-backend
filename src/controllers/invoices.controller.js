// src/controllers/invoices.controller.js

const prisma = require('../config/database');

// Create a new invoice
exports.createInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoices.create({
      data: req.body,
    });
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

// Get all invoices
exports.getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await prisma.invoices.findMany();
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await prisma.invoices.findUnique({
      where: { invoice_id: parseInt(req.params.id) },
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

// Update invoice by ID
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoices.update({
      where: { invoice_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

// Delete invoice by ID
exports.deleteInvoice = async (req, res, next) => {
  try {
    await prisma.invoices.delete({
      where: { invoice_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};