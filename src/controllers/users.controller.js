// src/controllers/users.controller.js

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Multer setup for user picture uploads
const uploadDir = path.join(__dirname, '../../uploads/user_pictures');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `user_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });
exports.uploadUserPicture = upload.single('user_picture');
const prisma = require('../config/database');

// Create a new user
exports.createUser = async (req, res, next) => {
  try {
    let userPictureUrl = null;
    if (req.file) {
      // Save the relative URL for the uploaded picture
      userPictureUrl = `/uploads/user_pictures/${req.file.filename}`;
    }
    const user = await prisma.users.create({
      data: {
        ...req.body,
        site_id: req.body.site_id ? parseInt(req.body.site_id) : null,
        user_picture: userPictureUrl,
      },
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
        user_id: true,
        employee_number: true,
        qatar_id_number: true,
        profession: true,
        employee_name: true,
        mobile_number: true,
        role_id: true,
        site_id: true,
        user_picture: true, // Add user_picture
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
      user_id: user.user_id,
      employee_number: user.employee_number,
      qatar_id_number: user.qatar_id_number,
      profession: user.profession,
      employee_name: user.employee_name,
      mobile_number: user.mobile_number,
      role_id: user.role_id,
      site_id: user.site_id,
      user_picture: user.user_picture, // Add user_picture
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
      where: { user_id: parseInt(req.params.id) },
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
        user_id: true,
        employee_number: true,
        qatar_id_number: true,
        profession: true,
        employee_name: true,
        mobile_number: true,
        role_id: true,
        site_id: true,
        user_picture: true, // Add user_picture
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
        userId: user.user_id,
        employeeNumber: user.employee_number,
        qatarIdNumber: user.qatar_id_number,
        profession: user.profession,
        employeeName: user.employee_name,
        mobileNumber: user.mobile_number,
        role: user.roles?.role_name,
        site: user.sites?.site_name,
        siteId: user.site_id,
        userPicture: user.user_picture // Add user_picture
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user by ID
exports.updateUser = async (req, res, next) => {
  try {
    const { employee_number, qatar_id_number, profession, employee_name, mobile_number, role_id, site_id, password } = req.body;
    let userPictureUrl = req.body.user_picture || null;
    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      userPictureUrl = `${protocol}://${host}/uploads/user_pictures/${req.file.filename}`;
    }
    // Prepare update data
    const updateData = {
      employee_number,
      qatar_id_number,
      profession,
      employee_name,
      mobile_number,
      role_id: parseInt(role_id),
      site_id: site_id ? parseInt(site_id) : null,
      user_picture: userPictureUrl,
    };

    // Only update password if provided
    if (password) {
      const bcrypt = require('bcryptjs');
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    const user = await prisma.users.update({
      where: { user_id: parseInt(req.params.id) },
      data: updateData,
      select: {
        user_id: true,
        employee_number: true,
        qatar_id_number: true,
        profession: true,
        employee_name: true,
        mobile_number: true,
        role_id: true,
        site_id: true,
        user_picture: true,
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
        user_id: user.user_id,
        employee_number: user.employee_number,
        qatar_id_number: user.qatar_id_number,
        profession: user.profession,
        employee_name: user.employee_name,
        mobile_number: user.mobile_number,
        role_id: user.role_id,
        site_id: user.site_id,
        user_picture: user.user_picture,
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
      where: { user_id: userId }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    await prisma.users.delete({
      where: { user_id: userId }
    });
    
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
