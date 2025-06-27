// src/controllers/users.controller.js

const prisma = require('../config/database');

// Create a new user
exports.createUser = async (req, res, next) => {
  try {
    const user = await prisma.users.create({
      data: req.body,
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        employee_id: true,
        employee_number: true,
        employee_name: true,
        mobile_number: true,
        role_id: true,
        site_id: true,
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
      }
    });
    
    const formattedUsers = users.map(user => ({
      employee_id: user.employee_id,
      employee_number: user.employee_number,
      employee_name: user.employee_name,
      mobile_number: user.mobile_number,
      role_id: user.role_id,
      site_id: user.site_id,
      role_name: user.roles?.role_name,
      site_name: user.sites?.site_name
    }));
    
    res.json({
      status: 'success',
      data: formattedUsers
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { employee_id: parseInt(req.params.id) },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Get user by employee number
exports.getUserByEmployeeNumber = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { employee_number: req.params.employeeNumber },
      select: {
        employee_id: true,
        employee_number: true,
        employee_name: true,
        mobile_number: true,
        role_id: true,
        site_id: true,
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
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Employee not found' 
      });
    }
    
    res.json({
      status: 'success',
      data: {
        employeeNumber: user.employee_number,
        employeeName: user.employee_name,
        mobileNumber: user.mobile_number,
        role: user.roles?.role_name,
        site: user.sites?.site_name,
        siteId: user.site_id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user by ID
exports.updateUser = async (req, res, next) => {
  try {
    const { employee_number, employee_name, mobile_number, role_id, site_id, password } = req.body;
    
    // Prepare update data
    const updateData = {
      employee_number,
      employee_name,
      mobile_number,
      role_id: parseInt(role_id),
      site_id: parseInt(site_id)
    };

    // Only update password if provided
    if (password) {
      const bcrypt = require('bcryptjs');
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    const user = await prisma.users.update({
      where: { employee_id: parseInt(req.params.id) },
      data: updateData,
      select: {
        employee_id: true,
        employee_number: true,
        employee_name: true,
        mobile_number: true,
        role_id: true,
        site_id: true,
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
      }
    });
    
    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        employee_id: user.employee_id,
        employee_number: user.employee_number,
        employee_name: user.employee_name,
        mobile_number: user.mobile_number,
        role_id: user.role_id,
        site_id: user.site_id,
        role_name: user.roles?.role_name,
        site_name: user.sites?.site_name
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user by ID
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { employee_id: userId }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    await prisma.users.delete({
      where: { employee_id: userId }
    });
    
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
