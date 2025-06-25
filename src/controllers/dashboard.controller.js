// src/controllers/dashboard.controller.js

const prisma = require('../config/database');

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get total fuel received
    const totalReceived = await prisma.diesel_receiving.aggregate({
      _sum: {
        quantity_liters: true
      }
    });

    // Get total fuel consumed
    const totalConsumed = await prisma.diesel_consumption.aggregate({
      _sum: {
        quantity_liters: true
      }
    });

    // Calculate current stock (received - consumed)
    const receivedAmount = totalReceived._sum.quantity_liters || 0;
    const consumedAmount = totalConsumed._sum.quantity_liters || 0;
    const currentStock = receivedAmount - consumedAmount;

    // Get active jobs count
    const currentDate = new Date();
    const activeJobsCount = await prisma.jobs_projects.count({
      where: {
        start_date: {
          lte: currentDate
        },
        end_date: {
          gte: currentDate
        }
      }
    });

    const stats = {
      totalFuelReceived: receivedAmount,
      totalConsumed: consumedAmount,
      currentStock: currentStock,
      activeJobs: activeJobsCount
    };

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Get recent fuel activities for dashboard table
exports.getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentConsumption = await prisma.diesel_consumption.findMany({
      take: limit,
      orderBy: {
        consumption_datetime: 'desc'
      },
      include: {
        vehicles_equipment: {
          select: {
            type: true,
            plate_number_machine_id: true
          }
        },
        operator_driver_user: {
          select: {
            employee_name: true,
            mobile_number: true
          }
        },
        jobs_projects: {
          select: {
            job_number: true
          }
        }
      }
    });

    const activities = recentConsumption.map(consumption => ({
      date: consumption.consumption_datetime.toISOString().slice(0, 16).replace('T', ' '),
      vehicle: `${consumption.vehicles_equipment.type} ${consumption.vehicles_equipment.plate_number_machine_id}`,
      operator: consumption.operator_driver_user.employee_name,
      mobile: consumption.operator_driver_user.mobile_number,
      quantity: consumption.quantity_liters,
      job: consumption.jobs_projects.job_number,
      status: 'Active' // You can add logic to determine status
    }));

    res.json({
      status: 'success',
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// Get fuel level alerts
exports.getFuelAlerts = async (req, res, next) => {
  try {
    const tanks = await prisma.tanks.findMany({
      include: {
        sites: {
          select: {
            site_name: true
          }
        }
      }
    });

    const alerts = [];

    for (const tank of tanks) {
      // Calculate current tank level
      const received = await prisma.diesel_receiving.aggregate({
        where: {
          tank_id: tank.tank_id
        },
        _sum: {
          quantity_liters: true
        }
      });

      // For consumption from tanks, we'd need to track which tank fuel was taken from
      // For now, we'll use a simple calculation
      const receivedAmount = received._sum.quantity_liters || 0;
      const currentLevel = receivedAmount; // Simplified - in real scenario, subtract consumed amount
      const percentageFull = (currentLevel / tank.capacity_liters) * 100;

      if (percentageFull < 50) {
        alerts.push({
          type: 'warning',
          message: `Low fuel alert: ${tank.tank_name} at ${tank.sites.site_name} is below 50% capacity`,
          tankName: tank.tank_name,
          siteName: tank.sites.site_name,
          currentLevel: currentLevel,
          capacity: tank.capacity_liters,
          percentageFull: Math.round(percentageFull)
        });
      }
    }

    res.json({
      status: 'success',
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// Get current stock levels for all tanks
exports.getTankStockLevels = async (req, res, next) => {
  try {
    const tanks = await prisma.tanks.findMany({
      include: {
        sites: {
          select: {
            site_name: true
          }
        }
      }
    });

    const stockLevels = [];

    for (const tank of tanks) {
      // Calculate current tank level
      const received = await prisma.diesel_receiving.aggregate({
        where: {
          tank_id: tank.tank_id
        },
        _sum: {
          quantity_liters: true
        }
      });

      const receivedAmount = received._sum.quantity_liters || 0;
      const percentageFull = (receivedAmount / tank.capacity_liters) * 100;

      stockLevels.push({
        tankId: tank.tank_id,
        tankName: tank.tank_name,
        siteName: tank.sites.site_name,
        capacity: tank.capacity_liters,
        currentLevel: receivedAmount,
        percentageFull: Math.round(percentageFull),
        status: percentageFull < 25 ? 'critical' : percentageFull < 50 ? 'warning' : 'good'
      });
    }

    res.json({
      status: 'success',
      data: stockLevels
    });
  } catch (error) {
    next(error);
  }
};
