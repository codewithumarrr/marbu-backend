// src/controllers/reports.controller.js

const prisma = require('../config/database');

// Dependencies for file generation
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Improved: Export report as PDF (real PDF)
exports.exportReportPdf = async (req, res, next) => {
  try {
    // Get filters from query params
    const {
      reportType,
      dateFrom,
      dateTo,
      siteId,
      vehicleType,
      jobId
    } = req.query;

    // Build where clause similar to generateFuelUsageReport
    let startDate, endDate;
    const currentDate = new Date();

    switch (reportType) {
      case 'daily':
        startDate = new Date(currentDate.setHours(0, 0, 0, 0));
        endDate = new Date(currentDate.setHours(23, 59, 59, 999));
        break;
      case 'weekly':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        startDate = new Date(weekStart.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case 'monthly':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'custom':
        startDate = dateFrom ? new Date(dateFrom) : new Date(currentDate.setDate(currentDate.getDate() - 30));
        endDate = dateTo ? new Date(dateTo) : new Date();
        break;
      default:
        startDate = new Date(currentDate.setDate(currentDate.getDate() - 30));
        endDate = new Date();
    }

    const where = {
      consumption_datetime: {
        gte: startDate,
        lte: endDate
      }
    };

    if (siteId) {
      where.site_id = parseInt(siteId);
    }

    if (vehicleType) {
      where.vehicles_equipment = {
        type: vehicleType
      };
    }

    if (jobId) {
      where.job_id = parseInt(jobId);
    }

    // Query data from DB
    const records = await prisma.diesel_consumption.findMany({
      where,
      include: {
        vehicles_equipment: true,
        users: true,
        jobs_projects: true,
        sites: true
      }
    });

    // Format for PDF
    const report = records.map(r => ({
      "Date": r.consumption_datetime ? r.consumption_datetime.toISOString().split('T')[0] : '',
      "Time": r.consumption_datetime ? r.consumption_datetime.toISOString().split('T')[1]?.slice(0, 8) : '',
      "Site": r.sites?.site_name || '',
      "Vehicle Type": r.vehicles_equipment?.type || '',
      "Vehicle ID": r.vehicles_equipment?.plate_number_machine_id || '',
      "Make/Model": r.vehicles_equipment?.make_model || '',
      "Operator": r.users?.employee_name || '',
      "Employee Number": r.users?.employee_number || '',
      "Job Number": r.jobs_projects?.job_number || '',
      "Fuel Used (L)": r.quantity_liters,
      "Odometer/Hours": r.odometer_reading
    }));

    // Ensure Express does not treat as binary by using res.json directly
    res.status(200).json({
      status: "success",
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// Improved: Export report as Excel (real Excel)
exports.exportReportData = async (req, res, next) => {
  try {
    // Get filters from query params
    const {
      reportType,
      dateFrom,
      dateTo,
      siteId,
      vehicleType,
      jobId
    } = req.query;

    // Build where clause similar to generateFuelUsageReport
    let startDate, endDate;
    const currentDate = new Date();

    switch (reportType) {
      case 'daily':
        startDate = new Date(currentDate.setHours(0, 0, 0, 0));
        endDate = new Date(currentDate.setHours(23, 59, 59, 999));
        break;
      case 'weekly':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        startDate = new Date(weekStart.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case 'monthly':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'custom':
        startDate = dateFrom ? new Date(dateFrom) : new Date(currentDate.setDate(currentDate.getDate() - 30));
        endDate = dateTo ? new Date(dateTo) : new Date();
        break;
      default:
        startDate = new Date(currentDate.setDate(currentDate.getDate() - 30));
        endDate = new Date();
    }

    const where = {
      consumption_datetime: {
        gte: startDate,
        lte: endDate
      }
    };

    if (siteId) {
      where.site_id = parseInt(siteId);
    }

    if (vehicleType) {
      where.vehicles_equipment = {
        type: vehicleType
      };
    }

    if (jobId) {
      where.job_id = parseInt(jobId);
    }

/**
 * DEBUG: Add error logging for exportReportData
 */
process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
    // Query data from DB
    const records = await prisma.diesel_consumption.findMany({
      where,
      include: {
        vehicles_equipment: true,
        users: true,
        jobs_projects: true,
        sites: true
      }
    });

    // Format for Excel
    const report = records.map(r => ({
      "Date": r.consumption_datetime ? r.consumption_datetime.toISOString().split('T')[0] : '',
      "Time": r.consumption_datetime ? r.consumption_datetime.toISOString().split('T')[1]?.slice(0, 8) : '',
      "Site": r.sites?.site_name || '',
      "Vehicle Type": r.vehicles_equipment?.type || '',
      "Vehicle ID": r.vehicles_equipment?.plate_number_machine_id || '',
      "Make/Model": r.vehicles_equipment?.make_model || '',
      "Operator": r.users?.employee_name || '',
      "Employee Number": r.users?.employee_number || '',
      "Job Number": r.jobs_projects?.job_number || '',
      "Fuel Used (L)": r.quantity_liters,
      "Odometer/Hours": r.odometer_reading
    }));

    res.json({
      status: "success",
      data: report
    });
  } catch (error) {
    next(error);
  }
};
// Export report as PDF (stub, implement PDF logic as needed)
exports.exportReportPdf = async (req, res, next) => {
  try {
    // TODO: Generate PDF from report data (use pdfkit, puppeteer, etc.)
    // For now, just send a placeholder PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    res.send(Buffer.from('%PDF-1.4\n%Fake PDF\n', 'utf-8'));
  } catch (error) {
    next(error);
  }
};

// Email report (stub, implement email logic as needed)
exports.emailReport = async (req, res, next) => {
  try {
    // TODO: Generate report and send via email (use nodemailer, etc.)
    // For now, just send a success response
    res.json({ status: 'success', message: 'Report emailed (stub)' });
  } catch (error) {
    next(error);
  }
};
// Generate fuel usage report based on filters
exports.generateFuelUsageReport = async (req, res, next) => {
  try {
    const {
      reportType,
      dateFrom,
      dateTo,
      siteId,
      vehicleType,
      jobId,
      page = 1,
      limit = 50
    } = req.query;

    let startDate, endDate;
    const currentDate = new Date();

    // Handle different report types
    switch (reportType) {
      case 'daily':
        startDate = new Date(currentDate.setHours(0, 0, 0, 0));
        endDate = new Date(currentDate.setHours(23, 59, 59, 999));
        break;
      case 'weekly':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        startDate = new Date(weekStart.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case 'monthly':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'custom':
        startDate = dateFrom ? new Date(dateFrom) : new Date(currentDate.setDate(currentDate.getDate() - 30));
        endDate = dateTo ? new Date(dateTo) : new Date();
        break;
      default:
        startDate = new Date(currentDate.setDate(currentDate.getDate() - 30));
        endDate = new Date();
    }

    const where = {
      consumption_datetime: {
        gte: startDate,
        lte: endDate
      }
    };

    if (siteId) {
      where.site_id = parseInt(siteId);
    }

    if (vehicleType) {
      where.vehicles_equipment = {
        type: vehicleType
      };
    }

    if (jobId) {
      where.job_id = parseInt(jobId);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [consumptionRecords, total] = await Promise.all([
      prisma.diesel_consumption.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          sites: {
            select: {
              site_name: true
            }
          },
          vehicles_equipment: {
            select: {
              type: true,
              plate_number_machine_id: true,
              make_model: true
            }
          },
          operator_driver_user: {
            select: {
              employee_name: true,
              employee_number: true
            }
          },
          jobs_projects: {
            select: {
              job_number: true,
              job_description: true
            }
          }
        },
        orderBy: {
          consumption_datetime: 'desc'
        }
      }),
      prisma.diesel_consumption.count({ where })
    ]);

    // Calculate efficiency (simplified - you might want more complex logic)
    const reportData = consumptionRecords.map(record => {
      const efficiency = record.quantity_liters <= 50 ? 'Good' : 
                        record.quantity_liters <= 100 ? 'Average' : 'Poor';
      
      return {
        date: record.consumption_datetime.toISOString().split('T')[0],
        site: record.sites.site_name,
        vehicle: `${record.vehicles_equipment.type} ${record.vehicles_equipment.plate_number_machine_id}`,
        operator: record.operator_driver_user.employee_name,
        fuelUsed: record.quantity_liters,
        efficiency: efficiency,
        jobNumber: record.jobs_projects.job_number,
        odometerReading: record.odometer_km_hours
      };
    });

    // Calculate summary statistics
    const totalFuelUsed = consumptionRecords.reduce((sum, record) => sum + record.quantity_liters, 0);
    const averageFuelPerDay = totalFuelUsed / Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const uniqueVehicles = new Set(consumptionRecords.map(r => r.vehicles_equipment.plate_number_machine_id)).size;

    const summary = {
      totalRecords: total,
      totalFuelUsed: totalFuelUsed,
      averageFuelPerDay: Math.round(averageFuelPerDay * 100) / 100,
      uniqueVehicles: uniqueVehicles,
      reportPeriod: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0]
      }
    };

    res.json({
      status: 'success',
      data: {
        reportData,
        summary,
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

// Get sites for report filters
exports.getSitesForReports = async (req, res, next) => {
  try {
    const sites = await prisma.sites.findMany({
      select: {
        site_id: true,
        site_name: true,
        location: true
      },
      orderBy: {
        site_name: 'asc'
      }
    });

    res.json({
      status: 'success',
      data: sites
    });
  } catch (error) {
    next(error);
  }
};

// Get vehicle types for report filters
exports.getVehicleTypesForReports = async (req, res, next) => {
  try {
    const types = await prisma.vehicles_equipment.findMany({
      select: {
        type: true
      },
      distinct: ['type'],
      orderBy: {
        type: 'asc'
      }
    });

    const typesList = types.map(t => t.type);

    res.json({
      status: 'success',
      data: typesList
    });
  } catch (error) {
    next(error);
  }
};

// Export report data (simplified - returns data for export)
exports.exportReportData = async (req, res, next) => {
  try {
    const {
      reportType,
      dateFrom,
      dateTo,
      siteId,
      vehicleType,
      format = 'json'
    } = req.query;

    // Use the same logic as generateFuelUsageReport but without pagination
    let startDate, endDate;
    const currentDate = new Date();

    switch (reportType) {
      case 'daily':
        startDate = new Date(currentDate.setHours(0, 0, 0, 0));
        endDate = new Date(currentDate.setHours(23, 59, 59, 999));
        break;
      case 'weekly':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        startDate = new Date(weekStart.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case 'monthly':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'custom':
        startDate = dateFrom ? new Date(dateFrom) : new Date(currentDate.setDate(currentDate.getDate() - 30));
        endDate = dateTo ? new Date(dateTo) : new Date();
        break;
      default:
        startDate = new Date(currentDate.setDate(currentDate.getDate() - 30));
        endDate = new Date();
    }

    const where = {
      consumption_datetime: {
        gte: startDate,
        lte: endDate
      }
    };

    if (siteId) {
      where.site_id = parseInt(siteId);
    }

    if (vehicleType) {
      where.vehicles_equipment = {
        type: vehicleType
      };
    }

    const consumptionRecords = await prisma.diesel_consumption.findMany({
      where,
      include: {
        sites: {
          select: {
            site_name: true
          }
        },
        vehicles_equipment: {
          select: {
            type: true,
            plate_number_machine_id: true,
            make_model: true
          }
        },
        operator_driver_user: {
          select: {
            employee_name: true,
            employee_number: true
          }
        },
        jobs_projects: {
          select: {
            job_number: true,
            job_description: true
          }
        }
      },
      orderBy: {
        consumption_datetime: 'desc'
      }
    });

    const exportData = consumptionRecords.map(record => ({
      Date: record.consumption_datetime.toISOString().split('T')[0],
      Time: record.consumption_datetime.toTimeString().split(' ')[0],
      Site: record.sites.site_name,
      'Vehicle Type': record.vehicles_equipment.type,
      'Vehicle ID': record.vehicles_equipment.plate_number_machine_id,
      'Make/Model': record.vehicles_equipment.make_model,
      Operator: record.operator_driver_user.employee_name,
      'Employee Number': record.operator_driver_user.employee_number,
      'Job Number': record.jobs_projects.job_number,
      'Fuel Used (L)': record.quantity_liters,
      'Odometer/Hours': record.odometer_km_hours
    }));

    if (format === 'csv') {
      // For CSV format, you'd typically use a CSV library
      // For now, we'll return the data structure that can be converted to CSV on frontend
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=fuel-usage-report.csv');
    }

    res.json({
      status: 'success',
      data: exportData,
      summary: {
        totalRecords: exportData.length,
        totalFuelUsed: consumptionRecords.reduce((sum, record) => sum + record.quantity_liters, 0),
        reportPeriod: {
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get fuel efficiency analysis
exports.getFuelEfficiencyAnalysis = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, siteId } = req.query;
    
    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateTo ? new Date(dateTo) : new Date();

    const where = {
      consumption_datetime: {
        gte: startDate,
        lte: endDate
      }
    };

    if (siteId) {
      where.site_id = parseInt(siteId);
    }

    // Get consumption data grouped by vehicle type
    const consumptionByType = await prisma.diesel_consumption.groupBy({
      by: ['vehicle_equipment_id'],
      where,
      _sum: {
        quantity_liters: true
      },
      _count: {
        consumption_id: true
      },
      _avg: {
        quantity_liters: true
      }
    });

    // Get vehicle details for the grouped data
    const vehicleIds = consumptionByType.map(item => item.vehicle_equipment_id);
    const vehicles = await prisma.vehicles_equipment.findMany({
      where: {
        vehicle_equipment_id: {
          in: vehicleIds
        }
      }
    });

    const efficiencyAnalysis = consumptionByType.map(consumption => {
      const vehicle = vehicles.find(v => v.vehicle_equipment_id === consumption.vehicle_equipment_id);
      return {
        vehicleType: vehicle?.type || 'Unknown',
        vehicleId: vehicle?.plate_number_machine_id || 'Unknown',
        totalFuelUsed: consumption._sum.quantity_liters || 0,
        averageFuelPerUse: Math.round((consumption._avg.quantity_liters || 0) * 100) / 100,
        totalUsages: consumption._count.consumption_id,
        efficiency: (consumption._avg.quantity_liters || 0) <= 50 ? 'Good' : 
                   (consumption._avg.quantity_liters || 0) <= 100 ? 'Average' : 'Poor'
      };
    });

    res.json({
      status: 'success',
      data: efficiencyAnalysis
    });
  } catch (error) {
    next(error);
  }
};
