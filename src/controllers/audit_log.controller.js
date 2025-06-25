// src/controllers/audit_log.controller.js

const prisma = require('../config/database');

// Helper to generate details string for audit log
function generateDetails(log) {
  let action = log.action_type ? log.action_type.charAt(0).toUpperCase() + log.action_type.slice(1).toLowerCase() : '';
  let recordType = log.table_name || '';
  let recordId = log.record_id ? `ID: ${log.record_id}` : '';
  let user = log.changed_by_user ? log.changed_by_user.employee_name : '';
  let summary = `${user} performed ${action}`;
  // Try to parse old/new values for a more readable summary
  let oldVal, newVal;
  try { oldVal = log.old_value ? JSON.parse(log.old_value) : null; } catch { oldVal = log.old_value; }
  try { newVal = log.new_value ? JSON.parse(log.new_value) : null; } catch { newVal = log.new_value; }

  // Show only changed fields for UPDATE
  if (log.action_type === 'UPDATE' && oldVal && newVal) {
    const changedFields = [];
    for (const key in newVal) {
      if (oldVal[key] !== newVal[key]) {
        changedFields.push(`${key}: "${oldVal[key]}" → "${newVal[key]}"`);
      }
    }
    if (changedFields.length > 0) {
      summary += ` (changed fields: ${changedFields.join(', ')})`;
    }
  } else if (log.action_type === 'CREATE' && newVal) {
    // Show a summary of created record, but exclude sensitive fields
    const fields = Object.entries(newVal)
      .filter(([k, v]) =>
        typeof v !== 'string' || v.length < 40
      )
      .filter(([k]) =>
        !['password', 'password_hash', 'signature_image_path'].includes(k)
      )
      .map(([k, v]) => `${k}: "${v}"`);
    summary += ` (created fields: ${fields.join(', ')})`;
  } else if (log.action_type === 'DELETE' && oldVal) {
    // Show a summary of deleted record, but exclude sensitive fields
    const fields = Object.entries(oldVal)
      .filter(([k, v]) =>
        typeof v !== 'string' || v.length < 40
      )
      .filter(([k]) =>
        !['password', 'password_hash', 'signature_image_path'].includes(k)
      )
      .map(([k, v]) => `${k}: "${v}"`);
    summary += ` (deleted fields: ${fields.join(', ')})`;
  }
  return summary;
}

// Create a new audit log entry
exports.createAuditLog = async (req, res, next) => {
  try {
    const auditLog = await prisma.audit_log.create({
      data: {
        ...req.body,
        change_timestamp: new Date()
      },
    });
    res.status(201).json({
      status: 'success',
      message: 'Audit log entry created successfully',
      data: auditLog
    });
  } catch (error) {
    next(error);
  }
};

// Get filtered audit logs based on frontend filters
exports.getFilteredAuditLogs = async (req, res, next) => {
  try {
    const {
      actionType,
      userId,
      dateFrom,
      dateTo,
      recordType,
      page = 1,
      limit = 50
    } = req.query;

    const where = {};

    if (actionType) {
      where.action_type = actionType.toUpperCase();
    }

    if (userId) {
      where.changed_by_user_id = userId;
    }

    if (recordType) {
      where.table_name = recordType;
    }

    if (dateFrom) {
      where.change_timestamp = {
        ...where.change_timestamp,
        gte: new Date(dateFrom)
      };
    }

    if (dateTo) {
      where.change_timestamp = {
        ...where.change_timestamp,
        lte: new Date(dateTo)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [auditLogs, total] = await Promise.all([
      prisma.audit_log.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          changed_by_user: {
            select: {
              employee_name: true,
              employee_number: true
            }
          }
        },
        orderBy: {
          change_timestamp: 'desc'
        }
      }),
      prisma.audit_log.count({ where })
    ]);

    // Format for frontend
    const formattedLogs = auditLogs.map(log => ({
      timestamp: log.change_timestamp.toISOString().replace('T', ' ').slice(0, 19),
      user: log.changed_by_user.employee_name,
      action: log.action_type,
      recordType: log.table_name,
      recordId: log.record_id ? log.record_id.toString() : '',
      details: generateDetails(log)
    }));

    res.json({
      status: 'success',
      data: {
        auditLogs: formattedLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all audit log entries with relations
exports.getAllAuditLogs = async (req, res, next) => {
  try {
    const auditLogs = await prisma.audit_log.findMany({
      include: {
        changed_by_user: {
          select: {
            employee_name: true,
            employee_number: true
          }
        }
      },
      orderBy: {
        change_timestamp: 'desc'
      },
      take: 100 // Limit to recent 100 entries for performance
    });

    // Format for frontend
    const formattedLogs = auditLogs.map(log => ({
      timestamp: log.change_timestamp.toISOString().replace('T', ' ').slice(0, 19),
      user: log.changed_by_user.employee_name,
      action: log.action_type,
      recordType: log.table_name,
      recordId: log.record_id ? log.record_id.toString() : '',
      details: generateDetails(log)
    }));

    res.json({
      status: 'success',
      data: formattedLogs
    });
  } catch (error) {
    next(error);
  }
};

// Get audit log entry by ID
exports.getAuditLogById = async (req, res, next) => {
  try {
    const auditLog = await prisma.audit_log.findUnique({
      where: { log_id: parseInt(req.params.id) },
      include: {
        changed_by_user: {
          select: {
            employee_name: true,
            employee_number: true
          }
        }
      }
    });
    
    if (!auditLog) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Audit log entry not found' 
      });
    }
    
    res.json({
      status: 'success',
      data: auditLog
    });
  } catch (error) {
    next(error);
  }
};

// Get users for audit filter dropdown
exports.getUsersForAuditFilter = async (req, res, next) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        employee_number: true,
        employee_name: true
      },
      orderBy: {
        employee_name: 'asc'
      }
    });

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Get record types for audit filter dropdown
exports.getRecordTypesForAuditFilter = async (req, res, next) => {
  try {
    const recordTypes = await prisma.audit_log.findMany({
      select: {
        table_name: true
      },
      distinct: ['table_name'],
      orderBy: {
        table_name: 'asc'
      }
    });

    const types = recordTypes.map(rt => rt.table_name);

    res.json({
      status: 'success',
      data: types
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to log audit entries (can be used by other controllers)
exports.logAuditEntry = async (tableName, recordId, actionType, oldValue, newValue, userId) => {
  try {
    await prisma.audit_log.create({
      data: {
        table_name: tableName,
        record_id: recordId,
        action_type: actionType,
        old_value: oldValue ? JSON.stringify(oldValue) : null,
        new_value: newValue ? JSON.stringify(newValue) : null,
        changed_by_user_id: userId,
        change_timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error logging audit entry:', error);
  }
};

// Update audit log entry by ID (usually not needed for audit logs)
exports.updateAuditLog = async (req, res, next) => {
  try {
    const auditLog = await prisma.audit_log.update({
      where: { log_id: parseInt(req.params.id) },
      data: req.body,
    });
    
    res.json({
      status: 'success',
      message: 'Audit log entry updated successfully',
      data: auditLog
    });
  } catch (error) {
    next(error);
  }
};

// Delete audit log entry by ID (usually not allowed for audit logs)
exports.deleteAuditLog = async (req, res, next) => {
  try {
    await prisma.audit_log.delete({
      where: { log_id: parseInt(req.params.id) },
    });
    
    res.json({
      status: 'success',
      message: 'Audit log entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
