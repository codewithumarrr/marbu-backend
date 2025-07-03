// src/controllers/diesel_consumption.controller.js

const prisma = require('../config/database');

// Create fuel consumption record with frontend form data
exports.createFuelConsumption = async (req, res, next) => {
  try {
    const {
      vehicleEquipmentType,
      plateNumberMachineId,
      dateTime,
      jobNumber,
      operatorName,
      operatorMobile,
      employeeNumber,
      tankSource,
      quantity,
      odometerReading,
      thumbprintData,
      siteId,
      webauthnResponse
    } = req.body;

    // Validate WebAuthn response if present
    if (thumbprintData === 'webauthn' && webauthnResponse) {
      const verification = await verifyAuthenticationResponse(webauthnResponse);
      if (!verification.verified) {
        return res.status(400).json({
          status: 'error',
          message: 'WebAuthn authentication verification failed'
        });
      }
    }

    // Find the vehicle/equipment record
    const vehicleEquipment = await prisma.vehicles_equipment.findFirst({
      where: {
        plate_number_machine_id: plateNumberMachineId,
        type: vehicleEquipmentType
      }
    });

    if (!vehicleEquipment) {
      return res.status(400).json({
        status: 'error',
        message: 'Vehicle/Equipment not found. Please register it first.'
      });
    }

    // Find the job
    const job = await prisma.jobs_projects.findFirst({
      where: {
        job_number: jobNumber
      }
    });

    if (!job) {
      return res.status(400).json({
        status: 'error',
        message: 'Job number not found. Please check the job number.'
      });
    }

    const dieselConsumption = await prisma.diesel_consumption.create({
      data: {
        consumption_datetime: new Date(dateTime),
        quantity_liters: parseFloat(quantity),
        site_id: parseInt(siteId),
        vehicle_equipment_id: vehicleEquipment.vehicle_equipment_id,
        job_id: job.job_id,
        operator_driver_user_id: employeeNumber,
        odometer_km_hours: parseFloat(odometerReading),
        signature_image_path: thumbprintData === 'webauthn' ? 
          `webauthn:${webauthnResponse.id}` : 
          thumbprintData || '', // Store thumbprint or WebAuthn ID
        webauthn_response: thumbprintData === 'webauthn' ?
          JSON.stringify(webauthnResponse) :
          null, // Store full WebAuthn response
        created_at: new Date(),
        updated_at: new Date(),
        created_by_user_id: employeeNumber,
        updated_by_user_id: employeeNumber
      },
      include: {
        sites: {
          select: {
            site_name: true
          }
        },
        vehicles_equipment: true,
        jobs_projects: {
          select: {
            job_number: true,
            job_description: true
          }
        },
        operator_driver_user: {
          select: {
            employee_name: true,
            employee_number: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Fuel consumption recorded successfully',
      data: dieselConsumption
    });
  } catch (error) {
    next(error);
  }
};

// Get vehicle/equipment types for dropdown
exports.getVehicleEquipmentTypes = async (req, res, next) => {
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

// Get vehicles/equipment by type
exports.getVehiclesByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    const vehicles = await prisma.vehicles_equipment.findMany({
      where: {
        type: type
      },
      orderBy: {
        plate_number_machine_id: 'asc'
      }
    });

    res.json({
      status: 'success',
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

// Get active jobs for dropdown
exports.getActiveJobs = async (req, res, next) => {
  try {
    const currentDate = new Date();
    
    const jobs = await prisma.jobs_projects.findMany({
      where: {
        start_date: {
          lte: currentDate
        },
        end_date: {
          gte: currentDate
        }
      },
      orderBy: {
        job_number: 'asc'
      }
    });

    res.json({
      status: 'success',
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// Get operator/driver employees for dropdown
exports.getOperatorEmployees = async (req, res, next) => {
  try {
    const employees = await prisma.users.findMany({
      where: {
        roles: {
          role_name: {
            in: ['Operator', 'Driver', 'Equipment Operator', 'Site Manager', 'Admin']
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
      mobile_number: emp.mobile_number,
      role_name: emp.roles.role_name,
      site_name: emp.sites.site_name,
      display_name: `${emp.employee_name} (${emp.employee_number}) - ${emp.roles.role_name}`
    }));

    res.json({
      status: 'success',
      data: employeesForDropdown
    });
  } catch (error) {
    next(error);
  }
};

// Handle thumbprint data storage
exports.saveThumbprint = async (req, res, next) => {
  try {
    const { consumptionId, thumbprintData } = req.body;

    if (consumptionId) {
      // Update existing consumption record
      await prisma.diesel_consumption.update({
        where: { consumption_id: parseInt(consumptionId) },
        data: {
          signature_image_path: thumbprintData,
          updated_at: new Date()
        }
      });
    }

    res.json({
      status: 'success',
      message: 'Thumbprint saved successfully',
      data: { thumbprintData }
    });
  } catch (error) {
    next(error);
  }
};

// Get all diesel consumption records with relations
exports.getAllDieselConsumption = async (req, res, next) => {
  try {
    const dieselConsumption = await prisma.diesel_consumption.findMany({
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
        jobs_projects: {
          select: {
            job_number: true,
            job_description: true
          }
        },
        operator_driver_user: {
          select: {
            employee_name: true,
            employee_number: true,
            mobile_number: true
          }
        }
      },
      orderBy: {
        consumption_datetime: 'desc'
      }
    });

    res.json({
      status: 'success',
      data: dieselConsumption
    });
  } catch (error) {
    next(error);
  }
};

// Get diesel consumption record by ID
exports.getDieselConsumptionById = async (req, res, next) => {
  try {
    const dieselConsumption = await prisma.diesel_consumption.findUnique({
      where: { consumption_id: parseInt(req.params.id) },
      include: {
        sites: true,
        vehicles_equipment: true,
        jobs_projects: true,
        operator_driver_user: {
          select: {
            employee_name: true,
            employee_number: true,
            mobile_number: true
          }
        }
      }
    });
    
    if (!dieselConsumption) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Diesel consumption record not found' 
      });
    }
    
    res.json({
      status: 'success',
      data: dieselConsumption
    });
  } catch (error) {
    next(error);
  }
};

// Update diesel consumption record by ID
exports.updateDieselConsumption = async (req, res, next) => {
  try {
    const dieselConsumption = await prisma.diesel_consumption.update({
      where: { consumption_id: parseInt(req.params.id) },
      data: {
        ...req.body,
        updated_at: new Date()
      },
    });
    
    res.json({
      status: 'success',
      message: 'Diesel consumption record updated successfully',
      data: dieselConsumption
    });
  } catch (error) {
    next(error);
  }
};

// Delete diesel consumption record by ID
exports.deleteDieselConsumption = async (req, res, next) => {
  try {
    await prisma.diesel_consumption.delete({
      where: { consumption_id: parseInt(req.params.id) },
    });
    
    res.json({
      status: 'success',
      message: 'Diesel consumption record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
