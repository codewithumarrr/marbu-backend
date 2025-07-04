// src/controllers/invoices.controller.js

const prisma = require('../config/database');

// Create a new invoice with frontend form data
exports.createInvoice = async (req, res, next) => {
  try {
    const {
      site_id,
      invoice_date,
      start_date,
      end_date,
      total_amount,
      generated_by_user_id
    } = req.body;

    // Validate required fields
    if (!site_id || !invoice_date || !start_date || !end_date || !total_amount || !generated_by_user_id) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
    }

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
        invoice_date: new Date(invoice_date),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        site_id: parseInt(site_id),
        total_amount: parseFloat(total_amount),
        generated_by_user_id: generated_by_user_id
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
      dateFrom,
      dateTo,
      status,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    if (dateFrom && !dateTo) {
      where.invoice_date = { gte: new Date(dateFrom), lte: new Date(dateFrom) };
    } else if (!dateFrom && dateTo) {
      where.invoice_date = { gte: new Date(dateTo), lte: new Date(dateTo) };
    } else if (dateFrom && dateTo) {
      where.invoice_date = { gte: new Date(dateFrom), lte: new Date(dateTo) };
    }

    if (status) {
      where.status = status;
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
      date: invoice.invoice_date.toISOString().split('T')[0],
      dueDate: invoice.end_date.toISOString().split('T')[0],
      amount: `QAR ${invoice.total_amount.toFixed(2)}`,
      status: invoice.status || (invoice.total_amount > 0 ? 'Pending' : 'Paid'),
      site: invoice.sites?.site_name || '',
      generatedBy: invoice.generated_by_user?.employee_name || '',
      id: invoice.invoice_id
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
    
    // Map to include supplier, amount, status, items for frontend
    res.json({
      status: 'success',
      data: {
        invoice_id: invoice.invoice_id,
        invoice_number: invoice.invoice_number,
        supplier: invoice.sites?.site_name || 'N/A',
        invoice_date: invoice.invoice_date ? invoice.invoice_date.toISOString().split('T')[0] : '',
        end_date: invoice.end_date ? invoice.end_date.toISOString().split('T')[0] : '',
        total_amount: invoice.total_amount,
        status: invoice.status || (invoice.total_amount > 0 ? 'Pending' : 'Paid'),
        items: Array.isArray(invoice.invoice_items)
          ? invoice.invoice_items.map(item => ({
              description: item.diesel_consumption?.vehicles_equipment?.plate_number_machine_id || '',
              qty: item.quantity_liters,
              unitPrice: item.rate_per_liter,
              amount: item.amount
            }))
          : [],
        invoice_items: invoice.invoice_items,
        sites: invoice.sites,
        generated_by_user: invoice.generated_by_user
      }
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

    // If no dates provided, use last 30 days
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const queryStartDate = startDate ? new Date(startDate) : defaultStartDate;
    const queryEndDate = endDate ? new Date(endDate) : defaultEndDate;

    // Get consumption records for the period
    const consumptionRecords = await prisma.diesel_consumption.findMany({
      where: {
        consumption_datetime: {
          gte: queryStartDate,
          lte: queryEndDate
        },
        ...(siteId && { site_id: parseInt(siteId) }),
        ...(jobId && { job_id: parseInt(jobId) }),
        // Remove the invoice_items filter for now to include all records
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
        start_date: queryStartDate,
        end_date: queryEndDate,
        total_amount: totalAmount,
        generated_by_user_id: generatedByUserId || "EMP001", // Default to employee number string
        site_id: parseInt(siteId) || consumptionRecords[0].site_id || 1
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

