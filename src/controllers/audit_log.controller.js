// src/controllers/audit_log.controller.js

const prisma = require('../config/database');

// Helper to generate details string for audit log
function generateDetails(log) {
  const action = log.action_type;
  const tableName = log.table_name;
  const recordId = log.record_id;
  
  // Try to parse old/new values for a more readable summary
  let oldVal, newVal;
  try { oldVal = log.old_value ? JSON.parse(log.old_value) : null; } catch { oldVal = log.old_value; }
  try { newVal = log.new_value ? JSON.parse(log.new_value) : null; } catch { newVal = log.new_value; }

  // Generate user-friendly details based on table and action
  switch (action) {
    case 'CREATE':
      switch (tableName) {
        case 'diesel_receiving':
          const quantity = newVal?.quantity_liters ? `${newVal.quantity_liters}L` : '';
          const receiptNum = newVal?.receipt_number ? ` - ${newVal.receipt_number}` : '';
          return `Added new fuel receipt${quantity ? ` - ${quantity}` : ''}${receiptNum}`;
          
        case 'diesel_consumption':
          const consumedQty = newVal?.quantity_liters ? `${newVal.quantity_liters}L` : '';
          const vehicle = newVal?.plate_number_machine_id || '';
          return `Created fuel consumption record${consumedQty ? ` - ${consumedQty}` : ''}${vehicle ? ` for ${vehicle}` : ''}`;
          
        case 'invoices':
          const invoiceNum = newVal?.invoice_number ? ` - ${newVal.invoice_number}` : '';
          return `Generated new invoice${invoiceNum}`;
          
        case 'users':
          const userName = newVal?.employee_name ? ` - ${newVal.employee_name}` : '';
          return `Created new user account${userName}`;
          
        case 'vehicles_equipment':
          const plateNum = newVal?.plate_number_machine_id ? ` - ${newVal.plate_number_machine_id}` : '';
          return `Added new vehicle/equipment${plateNum}`;
          
        default:
          return `Created new ${tableName.replace('_', ' ')} record`;
      }
      
    case 'UPDATE':
      switch (tableName) {
        case 'diesel_receiving':
          return 'Updated fuel receipt record';
          
        case 'diesel_consumption':
          return 'Updated fuel consumption record';
          
        case 'invoices':
          return 'Modified invoice details';
          
        case 'users':
          const changedFields = [];
          if (oldVal && newVal) {
            for (const key in newVal) {
              if (oldVal[key] !== newVal[key] && !['password_hash', 'updated_at'].includes(key)) {
                changedFields.push(key.replace('_', ' '));
              }
            }
          }
          return `Updated user ${changedFields.length > 0 ? `(${changedFields.join(', ')})` : 'information'}`;
          
        case 'vehicles_equipment':
          return 'Updated vehicle/equipment details';
          
        default:
          return `Updated ${tableName.replace('_', ' ')} record`;
      }
      
    case 'DELETE':
      switch (tableName) {
        case 'diesel_receiving':
          const deletedReceipt = oldVal?.receipt_number ? ` - ${oldVal.receipt_number}` : '';
          return `Deleted fuel receipt${deletedReceipt}`;
          
        case 'diesel_consumption':
          return 'Deleted fuel consumption record';
          
        case 'invoices':
          const deletedInvoice = oldVal?.invoice_number ? ` - ${oldVal.invoice_number}` : '';
          return `Deleted invoice${deletedInvoice}`;
          
        case 'users':
          const deletedUser = oldVal?.employee_name ? ` - ${oldVal.employee_name}` : '';
          return `Removed user account${deletedUser}`;
          
        default:
          return `Deleted ${tableName.replace('_', ' ')} record`;
      }
      
    case 'VIEW':
      switch (tableName) {
        case 'reports':
          return 'Generated monthly fuel report';
          
        case 'invoices':
          return 'Viewed invoice details';
          
        case 'diesel_receiving':
          return 'Accessed fuel receipt records';
          
        case 'diesel_consumption':
          return 'Reviewed fuel consumption data';
          
        default:
          return `Viewed ${tableName.replace('_', ' ')} records`;
      }
      
    default:
      return `Performed ${action.toLowerCase()} on ${tableName.replace('_', ' ')}`;
  }
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
      logId: log.log_id, // Add unique identifier
      timestamp: log.change_timestamp.toISOString().replace('T', ' ').slice(0, 19),
      user: log.changed_by_user.employee_name,
      action: log.action_type,
      recordType: log.table_name,
      recordId: log.record_id ? log.record_id.toString() : '',
      details: generateDetails(log)
    }));

    // Remove duplicates based on unique log_id
    const uniqueLogs = formattedLogs.filter((log, index, self) => 
      index === self.findIndex(l => l.logId === log.logId)
    );

    res.json({
      status: 'success',
      data: {
        auditLogs: uniqueLogs,
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
      logId: log.log_id, // Add unique identifier
      timestamp: log.change_timestamp.toISOString().replace('T', ' ').slice(0, 19),
      user: log.changed_by_user.employee_name,
      action: log.action_type,
      recordType: log.table_name,
      recordId: log.record_id ? log.record_id.toString() : '',
      details: generateDetails(log)
    }));

    // Remove duplicates based on unique combination of fields
    const uniqueLogs = formattedLogs.filter((log, index, self) => 
      index === self.findIndex(l => 
        l.logId === log.logId
      )
    );

    res.json({
      status: 'success',
      data: uniqueLogs
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

// Clean up duplicate audit log entries (admin function)
exports.cleanupDuplicateAuditLogs = async (req, res, next) => {
  try {
    // Find duplicates based on table_name, record_id, action_type, and changed_by_user_id
    const duplicates = await prisma.audit_log.groupBy({
      by: ['table_name', 'record_id', 'action_type', 'changed_by_user_id'],
      having: {
        log_id: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        log_id: true
      }
    });

    let deletedCount = 0;

    for (const duplicate of duplicates) {
      // Get all records with these criteria
      const records = await prisma.audit_log.findMany({
        where: {
          table_name: duplicate.table_name,
          record_id: duplicate.record_id,
          action_type: duplicate.action_type,
          changed_by_user_id: duplicate.changed_by_user_id
        },
        orderBy: {
          change_timestamp: 'desc'
        }
      });

      // Keep the most recent one, delete the rest
      if (records.length > 1) {
        const toDelete = records.slice(1); // Keep first (most recent), delete rest
        for (const record of toDelete) {
          await prisma.audit_log.delete({
            where: { log_id: record.log_id }
          });
          deletedCount++;
        }
      }
    }

    res.json({
      status: 'success',
      message: `Cleanup completed. Deleted ${deletedCount} duplicate audit log entries.`,
      data: {
        duplicateGroups: duplicates.length,
        deletedEntries: deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
};
