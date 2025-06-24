const { AppError } = require('../middleware/errorHandler');
const prisma = require('../config/database');

// Vehicle Management
const createVehicle = async (req, res, next) => {
  try {
    const {
      registrationNumber,
      make,
      model,
      year,
      vehicleTypeId,
      purchaseDate,
      currentMileage,
      dailyRentalRate,
      status = 'AVAILABLE'
    } = req.body;

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registrationNumber }
    });

    if (existingVehicle) {
      return next(new AppError('Vehicle with this registration number already exists', 400));
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber,
        make,
        model,
        year,
        vehicleTypeId,
        purchaseDate: new Date(purchaseDate),
        currentMileage,
        dailyRentalRate,
        status,
        lastServiceDate: new Date(),
        nextServiceMileage: currentMileage + 5000 // Default 5000km interval
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
    const { status, type } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (type) where.vehicleTypeId = parseInt(type);

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        vehicleType: true,
        _count: {
          select: {
            maintenanceRecords: true,
            fuelRecords: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: { vehicles }
    });
  } catch (error) {
    next(error);
  }
};

const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        vehicleType: true,
        maintenanceRecords: {
          take: 5,
          orderBy: { maintenanceDate: 'desc' },
          include: { maintenanceType: true }
        },
        fuelRecords: {
          take: 5,
          orderBy: { fuelDate: 'desc' }
        },
        tires: true,
        vehicleAssignments: {
          where: { actualReturnDate: null },
          include: {
            driver: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { vehicle }
    });
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.registrationNumber; // Prevent registration number changes

    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({
      status: 'success',
      data: { vehicle }
    });
  } catch (error) {
    next(error);
  }
};

// Maintenance Management
const createMaintenance = async (req, res, next) => {
  try {
    const {
      vehicleId,
      maintenanceTypeId,
      maintenanceDate,
      mileageAtService,
      cost,
      serviceCenter,
      technicianNotes,
      nextServiceMileage,
      nextServiceDate,
      partsUsed
    } = req.body;

    const maintenance = await prisma.$transaction(async (prisma) => {
      // Create maintenance record
      const record = await prisma.maintenanceRecord.create({
        data: {
          vehicleId,
          maintenanceTypeId,
          maintenanceDate: new Date(maintenanceDate),
          mileageAtService,
          cost,
          serviceCenter,
          technicianNotes,
          nextServiceMileage,
          nextServiceDate: new Date(nextServiceDate)
        }
      });

      // Update vehicle service info
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          lastServiceDate: new Date(maintenanceDate),
          nextServiceMileage,
          currentMileage: mileageAtService
        }
      });

      // Record parts used if any
      if (partsUsed && partsUsed.length > 0) {
        await Promise.all(partsUsed.map(part => 
          prisma.partsUsed.create({
            data: {
              maintenanceId: record.id,
              partId: part.partId,
              quantityUsed: part.quantity
            }
          })
        ));
      }

      return record;
    });

    res.status(201).json({
      status: 'success',
      data: { maintenance }
    });
  } catch (error) {
    next(error);
  }
};

const getMaintenanceHistory = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const maintenance = await prisma.maintenanceRecord.findMany({
      where: { vehicleId: parseInt(vehicleId) },
      include: {
        maintenanceType: true,
        partsUsed: {
          include: { part: true }
        }
      },
      orderBy: { maintenanceDate: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: { maintenance }
    });
  } catch (error) {
    next(error);
  }
};

// Tire Management
const createTire = async (req, res, next) => {
  try {
    const {
      vehicleId,
      position,
      brand,
      serialNumber,
      size,
      manufactureDate,
      purchaseDate,
      initialTreadDepth,
      currentTreadDepth,
      recommendedMinTread = 1.6
    } = req.body;

    const tire = await prisma.tire.create({
      data: {
        vehicleId,
        position,
        brand,
        model: req.body.model,
        serialNumber,
        size,
        manufactureDate: new Date(manufactureDate),
        purchaseDate: new Date(purchaseDate),
        initialTreadDepth,
        currentTreadDepth,
        recommendedMinTread,
        status: currentTreadDepth <= recommendedMinTread ? 'REPLACE' : 'ACTIVE'
      }
    });

    res.status(201).json({
      status: 'success',
      data: { tire }
    });
  } catch (error) {
    next(error);
  }
};

const getTires = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const tires = await prisma.tire.findMany({
      where: { vehicleId: parseInt(vehicleId) },
      orderBy: { position: 'asc' }
    });

    res.status(200).json({
      status: 'success',
      data: { tires }
    });
  } catch (error) {
    next(error);
  }
};

// Fuel Records
const recordFuel = async (req, res, next) => {
  try {
    const {
      vehicleId,
      fuelDate,
      mileage,
      liters,
      costPerLiter,
      stationName,
      notes
    } = req.body;

    const totalCost = parseFloat(liters) * parseFloat(costPerLiter);

    const fuelRecord = await prisma.$transaction(async (prisma) => {
      const record = await prisma.fuelRecord.create({
        data: {
          vehicleId,
          fuelDate: new Date(fuelDate),
          mileage,
          liters,
          costPerLiter,
          totalCost,
          stationName,
          notes
        }
      });

      // Update vehicle's current mileage
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { currentMileage: mileage }
      });

      return record;
    });

    res.status(201).json({
      status: 'success',
      data: { fuelRecord }
    });
  } catch (error) {
    next(error);
  }
};

const getFuelHistory = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { startDate, endDate } = req.query;
    
    const where = { vehicleId: parseInt(vehicleId) };
    
    if (startDate && endDate) {
      where.fuelDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const fuelRecords = await prisma.fuelRecord.findMany({
      where,
      orderBy: { fuelDate: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: { fuelRecords }
    });
  } catch (error) {
    next(error);
  }
};

// Vehicle Assignment
const assignVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { driverId, assignmentDate, expectedReturnDate, notes } = req.body;

    const activeAssignment = await prisma.vehicleAssignment.findFirst({
      where: {
        vehicleId: parseInt(vehicleId),
        actualReturnDate: null
      }
    });

    if (activeAssignment) {
      return next(new AppError('Vehicle is already assigned', 400));
    }

    const assignment = await prisma.$transaction(async (prisma) => {
      const record = await prisma.vehicleAssignment.create({
        data: {
          vehicleId: parseInt(vehicleId),
          driverId,
          assignmentDate: new Date(assignmentDate),
          expectedReturnDate: new Date(expectedReturnDate),
          notes,
          assignedById: req.user.id
        }
      });

      await prisma.vehicle.update({
        where: { id: parseInt(vehicleId) },
        data: { status: 'ASSIGNED' }
      });

      return record;
    });

    res.status(201).json({
      status: 'success',
      data: { assignment }
    });
  } catch (error) {
    next(error);
  }
};

const returnVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { actualReturnDate, notes } = req.body;

    const assignment = await prisma.$transaction(async (prisma) => {
      const record = await prisma.vehicleAssignment.updateMany({
        where: {
          vehicleId: parseInt(vehicleId),
          actualReturnDate: null
        },
        data: {
          actualReturnDate: new Date(actualReturnDate),
          notes: notes ? `${notes} | Return notes: ${req.body.notes}` : notes
        }
      });

      await prisma.vehicle.update({
        where: { id: parseInt(vehicleId) },
        data: { status: 'AVAILABLE' }
      });

      return record;
    });

    res.status(200).json({
      status: 'success',
      data: { assignment }
    });
  } catch (error) {
    next(error);
  }
};

// Statistics
const getVehicleStats = async (req, res, next) => {
  try {
    const [
      totalVehicles,
      maintenanceCosts,
      fuelCosts,
      vehicleUtilization
    ] = await Promise.all([
      // Total vehicles by status
      prisma.vehicle.groupBy({
        by: ['status'],
        _count: true
      }),
      
      // Maintenance costs by vehicle type
      prisma.maintenanceRecord.groupBy({
        by: ['vehicleId'],
        _sum: { cost: true }
      }),

      // Fuel costs by vehicle
      prisma.fuelRecord.groupBy({
        by: ['vehicleId'],
        _sum: { totalCost: true }
      }),

      // Vehicle utilization
      prisma.vehicleAssignment.groupBy({
        by: ['vehicleId'],
        _count: true
      })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalVehicles,
        maintenanceCosts,
        fuelCosts,
        vehicleUtilization
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  createMaintenance,
  getMaintenanceHistory,
  createTire,
  getTires,
  recordFuel,
  getFuelHistory,
  assignVehicle,
  returnVehicle,
  getVehicleStats
};