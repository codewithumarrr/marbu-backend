const { AppError } = require('../middleware/errorHandler');
const prisma = require('../config/database');

// Site Management
const createSite = async (req, res, next) => {
  try {
    const { name, location } = req.body;

    const existingSite = await prisma.site.findUnique({
      where: { name }
    });

    if (existingSite) {
      return next(new AppError('Site with this name already exists', 400));
    }

    const site = await prisma.site.create({
      data: { name, location }
    });

    res.status(201).json({
      status: 'success',
      data: { site }
    });
  } catch (error) {
    next(error);
  }
};

const getSites = async (req, res, next) => {
  try {
    const sites = await prisma.site.findMany({
      include: {
        tanks: true,
        _count: {
          select: {
            dieselReceivings: true,
            dieselConsumptions: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: { sites }
    });
  } catch (error) {
    next(error);
  }
};

// Tank Management
const createTank = async (req, res, next) => {
  try {
    const { name, capacity, siteId } = req.body;

    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site) {
      return next(new AppError('Site not found', 404));
    }

    const existingTank = await prisma.tank.findFirst({
      where: {
        name,
        siteId
      }
    });

    if (existingTank) {
      return next(new AppError('Tank with this name already exists at this site', 400));
    }

    const tank = await prisma.tank.create({
      data: {
        name,
        capacity,
        siteId
      }
    });

    res.status(201).json({
      status: 'success',
      data: { tank }
    });
  } catch (error) {
    next(error);
  }
};

const getTanks = async (req, res, next) => {
  try {
    const { siteId } = req.query;
    const where = siteId ? { siteId } : {};

    const tanks = await prisma.tank.findMany({
      where,
      include: {
        site: true
      }
    });

    res.status(200).json({
      status: 'success',
      data: { tanks }
    });
  } catch (error) {
    next(error);
  }
};

// Vehicle Management
const createVehicle = async (req, res, next) => {
  try {
    const { type, plateNumber, machineId, model, dailyLimit } = req.body;

    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        OR: [
          { plateNumber: plateNumber || null },
          { machineId: machineId || null }
        ]
      }
    });

    if (existingVehicle) {
      return next(new AppError('Vehicle with this plate number or machine ID already exists', 400));
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        type,
        plateNumber,
        machineId,
        model,
        dailyLimit
      }
    });

    res.status(201).json({
      status: 'success',
      data: { vehicle }
    });
  } catch (error) {
    next(error);
  }
};

const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany();

    res.status(200).json({
      status: 'success',
      data: { vehicles }
    });
  } catch (error) {
    next(error);
  }
};

// Diesel Receiving
const createDieselReceiving = async (req, res, next) => {
  try {
    const { receiptNumber, quantity, siteId, tankId, plateNo } = req.body;

    const tank = await prisma.tank.findUnique({
      where: { id: tankId },
      include: { site: true }
    });

    if (!tank) {
      return next(new AppError('Tank not found', 404));
    }

    if (tank.currentLevel + quantity > tank.capacity) {
      return next(new AppError('Tank capacity exceeded', 400));
    }

    // Create diesel receiving record
    const receiving = await prisma.$transaction([
      prisma.dieselReceiving.create({
        data: {
          receiptNumber,
          quantity,
          plateNo,
          siteId,
          tankId,
          receivedById: req.user.id
        }
      }),
      prisma.tank.update({
        where: { id: tankId },
        data: {
          currentLevel: {
            increment: quantity
          }
        }
      })
    ]);

    res.status(201).json({
      status: 'success',
      data: { receiving: receiving[0] }
    });
  } catch (error) {
    next(error);
  }
};

const getDieselReceivings = async (req, res, next) => {
  try {
    const { siteId, startDate, endDate } = req.query;
    const where = {};

    if (siteId) where.siteId = siteId;
    if (startDate && endDate) {
      where.receivedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const receivings = await prisma.dieselReceiving.findMany({
      where,
      include: {
        site: {
          select: {
            name: true,
            location: true
          }
        },
        tank: {
          select: {
            name: true,
            capacity: true,
            currentLevel: true
          }
        },
        receivedBy: {
          select: {
            name: true,
            employeeNumber: true
          }
        }
      },
      orderBy: {
        receivedAt: 'desc'
      }
    });

    // Format the data according to requirements
    const formattedReceivings = receivings.map(receiving => ({
      tankName: receiving.tank.name,
      receiptNumber: receiving.receiptNumber,
      fuelQuantity: receiving.quantity,
      plateNo: receiving.plateNo || 'N/A',
      receivedBy: receiving.receivedBy.name,
      siteLocation: receiving.site.location,
      date: receiving.receivedAt.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      })
    }));

    res.status(200).json({
      status: 'success',
      data: { receivings: formattedReceivings }
    });
  } catch (error) {
    next(error);
  }
};

const getDieselReceiving = async (req, res, next) => {
  try {
    const receiving = await prisma.dieselReceiving.findUnique({
      where: { id: req.params.id },
      include: {
        site: true,
        tank: true,
        supplier: true,
        receivedBy: {
          select: {
            id: true,
            name: true,
            employeeNumber: true
          }
        }
      }
    });

    if (!receiving) {
      return next(new AppError('Diesel receiving record not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { receiving }
    });
  } catch (error) {
    next(error);
  }
};

// Diesel Consumption
const createDieselConsumption = async (req, res, next) => {
  try {
    const {
      quantity,
      shift,
      jobNumber,
      odometerReading,
      equipmentHours,
      siteId,
      tankId,
      vehicleId
    } = req.body;

    // Check if tank has sufficient diesel
    const tank = await prisma.tank.findUnique({
      where: { id: tankId }
    });

    if (!tank) {
      return next(new AppError('Tank not found', 404));
    }

    if (tank.currentLevel < quantity) {
      return next(new AppError('Insufficient diesel in tank', 400));
    }

    // Check vehicle daily limit
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404));
    }

    if (vehicle.dailyLimit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayConsumption = await prisma.dieselConsumption.aggregate({
        where: {
          vehicleId,
          consumedAt: {
            gte: today
          }
        },
        _sum: {
          quantity: true
        }
      });

      if ((todayConsumption._sum.quantity || 0) + quantity > vehicle.dailyLimit) {
        return next(new AppError('Daily consumption limit exceeded for this vehicle', 400));
      }
    }

    const consumption = await prisma.$transaction([
      prisma.dieselConsumption.create({
        data: {
          quantity,
          shift,
          jobNumber,
          odometerReading,
          equipmentHours,
          siteId,
          tankId,
          vehicleId,
          operatorId: req.user.id
        }
      }),
      prisma.tank.update({
        where: { id: tankId },
        data: {
          currentLevel: {
            decrement: quantity
          }
        }
      })
    ]);

    res.status(201).json({
      status: 'success',
      data: { consumption: consumption[0] }
    });
  } catch (error) {
    next(error);
  }
};

const getDieselConsumptions = async (req, res, next) => {
  try {
    const { siteId, vehicleId, startDate, endDate } = req.query;
    const where = {};

    if (siteId) where.siteId = siteId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (startDate && endDate) {
      where.consumedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const consumptions = await prisma.dieselConsumption.findMany({
      where,
      include: {
        site: true,
        tank: true,
        vehicle: true,
        operator: {
          select: {
            id: true,
            name: true,
            employeeNumber: true
          }
        }
      },
      orderBy: {
        consumedAt: 'desc'
      }
    });

    res.status(200).json({
      status: 'success',
      data: { consumptions }
    });
  } catch (error) {
    next(error);
  }
};

const getDieselConsumption = async (req, res, next) => {
  try {
    const consumption = await prisma.dieselConsumption.findUnique({
      where: { id: req.params.id },
      include: {
        site: true,
        tank: true,
        vehicle: true,
        operator: {
          select: {
            id: true,
            name: true,
            employeeNumber: true
          }
        }
      }
    });

    if (!consumption) {
      return next(new AppError('Diesel consumption record not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { consumption }
    });
  } catch (error) {
    next(error);
  }
};

// Statistics
const getDieselStats = async (req, res, next) => {
  try {
    const { siteId, startDate, endDate } = req.query;
    const where = {};

    if (siteId) where.siteId = siteId;
    if (startDate && endDate) {
      where.consumedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const consumptionStats = await prisma.dieselConsumption.groupBy({
      by: ['vehicleId', 'shift'],
      where,
      _sum: {
        quantity: true
      }
    });

    const receivingStats = await prisma.dieselReceiving.groupBy({
      by: ['supplierId'],
      where: {
        ...where,
        receivedAt: where.consumedAt
      },
      _sum: {
        quantity: true
      }
    });

    const tankLevels = await prisma.tank.findMany({
      where: siteId ? { siteId } : {},
      select: {
        id: true,
        name: true,
        capacity: true,
        currentLevel: true,
        site: {
          select: {
            name: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        consumption: consumptionStats,
        receiving: receivingStats,
        tankLevels
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSite,
  getSites,
  createTank,
  getTanks,
  createVehicle,
  getVehicles,
  createDieselReceiving,
  getDieselReceivings,
  getDieselReceiving,
  createDieselConsumption,
  getDieselConsumptions,
  getDieselConsumption,
  getDieselStats
};