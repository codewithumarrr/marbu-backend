// src/controllers/invoices.controller.js

const prisma = require('../config/database');

// Create a new invoice with frontend form data
exports.createInvoice = async (req, res, next) => {
  try {
    const {
      supplier,
      date,
      dueDate,
      amount,
      status,
      siteId,
      generatedByUserId
    } = req.body;

    // Generate invoice number
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
        invoice_date: new Date(date),
        start_date: new Date(date), // You might want to make this configurable
        end_date: new Date(dueDate),
        total_amount: parseFloat(amount.replace(/[^\d.-]/g, '')), // Remove currency symbols
        generated_by_user_id: generatedByUserId,
        site_id: parseInt(siteId)
      },
      include: {
        sites: {
          select: {
            site_name: true
          }
        },
        generated_by_user: {
          select: {
            employee_name: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

// Get filtered invoices based on frontend filters
exports.getFilteredInvoices = async (req, res, next) => {
  try {
    const {
      invoiceType,
      supplierId,
      dateFrom,
      dateTo,
      status,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    if (supplierId) {
      // For supplier invoices, we'd need to link through invoice_items to consumption records
      // This is a simplified approach
      where.invoice_items = {
        some: {
          diesel_consumption: {
            // Add supplier filter logic here if needed
          }
        }
      };
    }

    if (dateFrom) {
      where.invoice_date = {
        ...where.invoice_date,
        gte: new Date(dateFrom)
      };
    }

    if (dateTo) {
      where.invoice_date = {
        ...where.invoice_date,
        lte: new Date(dateTo)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [invoices, total] = await Promise.all([
      prisma.invoices.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          sites: {
            select: {
              site_name: true
            }
          },
          generated_by_user: {
            select: {
              employee_name: true
            }
          },
          invoice_items: {
            include: {
              diesel_consumption: {
                include: {
                  vehicles_equipment: {
                    select: {
                      type: true,
                      plate_number_machine_id: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          invoice_date: 'desc'
        }
      }),
      prisma.invoices.count({ where })
    ]);

    // Format invoices for frontend
    const formattedInvoices = invoices.map(invoice => ({
      invoiceNo: invoice.invoice_number,
      supplier: 'Various', // You might want to determine this from invoice items
      date: invoice.invoice_date.toISOString().split('T')[0],
      dueDate: invoice.end_date.toISOString().split('T')[0],
      amount: `QAR ${invoice.total_amount.toFixed(2)}`,
      status: invoice.total_amount > 0 ? 'Pending' : 'Paid', // Simplified status logic
      site: invoice.sites.site_name,
      generatedBy: invoice.generated_by_user.employee_name
    }));

    res.json({
      status: 'success',
      data: {
        invoices: formattedInvoices,
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

// Get all invoices with relations
exports.getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await prisma.invoices.findMany({
      include: {
        sites: {
          select: {
            site_name: true
          }
        },
        generated_by_user: {
          select: {
            employee_name: true
          }
        },
        invoice_items: {
          include: {
            diesel_consumption: {
              include: {
                vehicles_equipment: {
                  select: {
                    type: true,
                    plate_number_machine_id: true
                  }
                },
                jobs_projects: {
                  select: {
                    job_number: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        invoice_date: 'desc'
      }
    });

    // Format for frontend
    const formattedInvoices = invoices.map(invoice => ({
      invoiceNo: invoice.invoice_number,
      supplier: 'Various',
      date: invoice.invoice_date.toISOString().split('T')[0],
      dueDate: invoice.end_date.toISOString().split('T')[0],
      amount: `QAR ${invoice.total_amount.toFixed(2)}`,
      status: 'Pending', // You can add logic to determine status
      site: invoice.sites.site_name,
      items: invoice.invoice_items.length
    }));

    res.json({
      status: 'success',
      data: formattedInvoices
    });
  } catch (error) {
    next(error);
  }
};

// Get invoice by ID with full details
exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await prisma.invoices.findUnique({
      where: { invoice_id: parseInt(req.params.id) },
      include: {
        sites: true,
        generated_by_user: {
          select: {
            employee_name: true,
            employee_number: true
          }
        },
        invoice_items: {
          include: {
            diesel_consumption: {
              include: {
                vehicles_equipment: true,
                jobs_projects: true,
                operator_driver_user: {
                  select: {
                    employee_name: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!invoice) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Invoice not found' 
      });
    }
    
    res.json({
      status: 'success',
      data: invoice
    });
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
    
    res.json({
      status: 'success',
      message: 'Invoice updated successfully',
      data: invoice
    });
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
    
    res.json({
      status: 'success',
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Generate invoice from consumption records
exports.generateInvoiceFromConsumption = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      siteId,
      jobId,
      generatedByUserId
    } = req.body;

    // Get consumption records for the period
    const consumptionRecords = await prisma.diesel_consumption.findMany({
      where: {
        consumption_datetime: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        ...(siteId && { site_id: parseInt(siteId) }),
        ...(jobId && { job_id: parseInt(jobId) }),
        // Only include records not already invoiced
        invoice_items: {
          none: {}
        }
      },
      include: {
        jobs_projects: true,
        vehicles_equipment: true
      }
    });

    if (consumptionRecords.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No consumption records found for the specified period'
      });
    }

    // Calculate total amount (you'd need to define rate per liter)
    const ratePerLiter = 2.5; // Example rate - this should come from configuration
    const totalAmount = consumptionRecords.reduce((sum, record) => 
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
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        total_amount: totalAmount,
        generated_by_user_id: generatedByUserId,
        site_id: parseInt(siteId) || consumptionRecords[0].site_id
      }
    });

    // Create invoice items
    const invoiceItems = await Promise.all(
      consumptionRecords.map(record =>
        prisma.invoice_items.create({
          data: {
            invoice_id: invoice.invoice_id,
            consumption_id: record.consumption_id,
            quantity_liters: record.quantity_liters,
            rate_per_liter: ratePerLiter,
            amount: record.quantity_liters * ratePerLiter,
            job_id: record.job_id
          }
        })
      )
    );

    res.status(201).json({
      status: 'success',
      message: 'Invoice generated successfully',
      data: {
        invoice,
        itemsCount: invoiceItems.length,
        totalAmount
      }
    });
  } catch (error) {
    next(error);
  }
};
