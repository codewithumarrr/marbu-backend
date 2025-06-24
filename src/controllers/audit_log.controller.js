// src/controllers/audit_log.controller.js

const prisma = require('../config/database');

// Create a new audit log entry
exports.createAuditLog = async (req, res, next) => {
  try {
    const auditLog = await prisma.audit_log.create({
      data: req.body,
    });
    res.status(201).json(auditLog);
  } catch (error) {
    next(error);
  }
};

// Get all audit log entries
exports.getAllAuditLogs = async (req, res, next) => {
  try {
    const auditLogs = await prisma.audit_log.findMany();
    res.json(auditLogs);
  } catch (error) {
    next(error);
  }
};

// Get audit log entry by ID
exports.getAuditLogById = async (req, res, next) => {
  try {
    const auditLog = await prisma.audit_log.findUnique({
      where: { log_id: parseInt(req.params.id) },
    });
    if (!auditLog) return res.status(404).json({ message: 'Audit log entry not found' });
    res.json(auditLog);
  } catch (error) {
    next(error);
  }
};

// Update audit log entry by ID
exports.updateAuditLog = async (req, res, next) => {
  try {
    const auditLog = await prisma.audit_log.update({
      where: { log_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(auditLog);
  } catch (error) {
    next(error);
  }
};

// Delete audit log entry by ID
exports.deleteAuditLog = async (req, res, next) => {
  try {
    await prisma.audit_log.delete({
      where: { log_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};