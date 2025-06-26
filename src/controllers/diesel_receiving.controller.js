// src/controllers/diesel_receiving.controller.js

const prisma = require('../config/database');

// Generate next receipt number
exports.getNextReceiptNumber = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const lastReceipt = await prisma.diesel_receiving.findFirst({
      where: {
        receipt_number: {
          startsWith: `RCP-${currentYear}-`
        }
      },
      orderBy: {
        receiving_id: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastReceipt) {
      const lastNumber = parseInt(lastReceipt.receipt_number.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    const receiptNumber = `RCP-${currentYear}-${nextNumber.toString().padStart(6, '0')}`;
    
    res.json({
      status: 'success',
      data: { receiptNumber }
    });
  } catch (error) {
    next(error);
  }
};

exports.generateInvoiceFromReceiving = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      siteId,
      generatedByUserId
    } = req.body;

    // If no dates provided, use last 30 days
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const queryStartDate = startDate ? new Date(startDate) : defaultStartDate;
    const queryEndDate = endDate ? new Date(endDate) : defaultEndDate;

    // Get receiving records for the period that are not already invoiced
    const receivingRecords = await prisma.diesel_receiving.findMany({
      where: {
        received_datetime: {
          gte: queryStartDate,
          lte: queryEndDate
        },
        ...(siteId && { site_id: parseInt(siteId) }),
        // Remove the invoice_items filter for now to include all records
      }
    });

    if (receivingRecords.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No receiving records found for the specified period'
      });
    }

    // Calculate total amount (define rate per liter)
    const ratePerLiter = 2.5; // Example rate
    const totalAmount = receivingRecords.reduce((sum, record) =>
      sum + (record.quantity_liters * ratePerLiter), 0
    );

    // Create invoice
    const currentYear = new Date().getFullYear();
    const lastInvoice = await prisma.invoices.findFirst({
      where: {
        invoice_number: {
          startsWith: `INV-${currentYear}-`
        }
      },
      orderBy: {
        invoice_id: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    const invoiceNumber = `INV-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;

    const invoice = await prisma.invoices.create({
      data: {
        invoice_number: invoiceNumber,
        invoice_date: new Date(),
        start_date: queryStartDate,
        end_date: queryEndDate,
        total_amount: totalAmount,
        generated_by_user_id: generatedByUserId || "EMP001", // Default to employee number string
        site_id: parseInt(siteId) || receivingRecords[0].site_id || 1
      }
    });

    // For receiving records, we don't create invoice_items since they're meant for consumption
    // Instead, we could create a custom tracking or just return the invoice
    // Note: invoice_items table is designed for consumption records, not receiving records

    res.status(201).json({
      status: 'success',
      message: 'Invoice generated successfully',
      data: {
        invoice,
        itemsCount: receivingRecords.length,
        totalAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create fuel receiving record with frontend form data
exports.createFuelReceiving = async (req, res, next) => {
  try {
    const {
      receiptNumber,
      dateTime,
      quantity,
      tankId,
      receivedBy,
      supplierId,
      mobileNumber,
      notes,
      siteId
    } = req.body;

    const dieselReceiving = await prisma.diesel_receiving.create({
      data: {
        receipt_number: receiptNumber,
        received_datetime: new Date(dateTime),
        quantity_liters: parseFloat(quantity),
        site_id: parseInt(siteId),
        tank_id: parseInt(tankId),
        received_by_user_id: receivedBy,
        supplier_id: parseInt(supplierId),
        signature_image_path: '', // Will be updated when signature is uploaded
        created_at: new Date(),
        updated_at: new Date(),
        created_by_user_id: receivedBy, // Assuming same user creates and receives
        updated_by_user_id: receivedBy
      },
      include: {
        sites: true,
        tanks: true,
        suppliers: true,
        received_by_user: {
          select: {
            employee_name: true,
            employee_number: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Fuel receipt recorded successfully',
      data: dieselReceiving
    });
  } catch (error) {
    next(error);
  }
};

// Get tanks by site with capacity info for dropdown
exports.getTanksBySite = async (req, res, next) => {
  try {
    const { siteId } = req.params;
    
    const tanks = await prisma.tanks.findMany({
      where: siteId ? { site_id: parseInt(siteId) } : {},
      include: {
        sites: {
          select: {
            site_name: true
          }
        }
      },
      orderBy: {
        tank_name: 'asc'
      }
    });

    const tanksWithInfo = tanks.map(tank => ({
      tank_id: tank.tank_id,
      tank_name: tank.tank_name,
      capacity_liters: tank.capacity_liters,
      site_name: tank.sites.site_name,
      display_name: `${tank.tank_name} (${tank.capacity_liters.toLocaleString()}L) - ${tank.sites.site_name}`
    }));

    res.json({
      status: 'success',
      data: tanksWithInfo
    });
  } catch (error) {
    next(error);
  }
};

// Get site-incharge employees for dropdown (updated logic)
exports.getTankInchargeEmployees = async (req, res, next) => {
  try {
    // Only return users with the role 'site-incharge'
    const employees = await prisma.users.findMany({
      where: {
        roles: {
          role_name: {
            in: ['Site Incharge', 'Admin']
          }
        }
      },
      include: {
        roles: {
          select: {
            role_name: true
          }
        },
        sites: {
          select: {
            site_name: true
          }
        }
      },
      orderBy: {
        employee_name: 'asc'
      }
    });

    const employeesForDropdown = employees.map(emp => ({
      employee_number: emp.employee_number,
      employee_name: emp.employee_name,
      role_name: emp.roles.role_name,
      site_name: emp.sites.site_name,
      display_name: `${emp.employee_name} (${emp.roles.role_name}) - ${emp.sites.site_name}`
    }));

    res.json({
      status: 'success',
      data: employeesForDropdown
    });
  } catch (error) {
    next(error);
  }
};

// Get active suppliers for dropdown
exports.getActiveSuppliers = async (req, res, next) => {
  try {
    const suppliers = await prisma.suppliers.findMany({
      orderBy: {
        supplier_name: 'asc'
      }
    });

    res.json({
      status: 'success',
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
};

// Get all diesel receiving records with relations
exports.getAllDieselReceiving = async (req, res, next) => {
  try {
    const dieselReceiving = await prisma.diesel_receiving.findMany({
      include: {
        sites: {
          select: {
            site_name: true
          }
        },
        tanks: {
          select: {
            tank_name: true
          }
        },
        suppliers: {
          select: {
            supplier_name: true
          }
        },
        received_by_user: {
          select: {
            employee_name: true
          }
        }
      },
      orderBy: {
        received_datetime: 'desc'
      }
    });

    res.json({
      status: 'success',
      data: dieselReceiving
    });
  } catch (error) {
    next(error);
  }
};

// Get diesel receiving record by ID
exports.getDieselReceivingById = async (req, res, next) => {
  try {
    const dieselReceiving = await prisma.diesel_receiving.findUnique({
      where: { receiving_id: parseInt(req.params.id) },
      include: {
        sites: true,
        tanks: true,
        suppliers: true,
        received_by_user: {
          select: {
            employee_name: true,
            employee_number: true
          }
        }
      }
    });
    
    if (!dieselReceiving) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Diesel receiving record not found' 
      });
    }
    
    res.json({
      status: 'success',
      data: dieselReceiving
    });
  } catch (error) {
    next(error);
  }
};

// Update diesel receiving record by ID
exports.updateDieselReceiving = async (req, res, next) => {
  try {
    const dieselReceiving = await prisma.diesel_receiving.update({
      where: { receiving_id: parseInt(req.params.id) },
      data: {
        ...req.body,
        updated_at: new Date()
      },
    });
    
    res.json({
      status: 'success',
      message: 'Diesel receiving record updated successfully',
      data: dieselReceiving
    });
  } catch (error) {
    next(error);
  }
};

// Delete diesel receiving record by ID
exports.deleteDieselReceiving = async (req, res, next) => {
  try {
    await prisma.diesel_receiving.delete({
      where: { receiving_id: parseInt(req.params.id) },
    });
    
    res.json({
      status: 'success',
      message: 'Diesel receiving record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
