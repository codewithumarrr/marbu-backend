// src/controllers/suppliers.controller.js

const prisma = require('../config/database');

// Create a new supplier
exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await prisma.suppliers.create({
      data: req.body,
    });
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

// Get all suppliers
exports.getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await prisma.suppliers.findMany();
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

// Get supplier by ID
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await prisma.suppliers.findUnique({
      where: { supplier_id: parseInt(req.params.id) },
    });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

// Update supplier by ID
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await prisma.suppliers.update({
      where: { supplier_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

// Delete supplier by ID
exports.deleteSupplier = async (req, res, next) => {
  try {
    await prisma.suppliers.delete({
      where: { supplier_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};