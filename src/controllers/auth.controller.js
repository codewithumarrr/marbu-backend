const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/errorHandler');
const {
  signToken,
  signRefreshToken,
  findUserByEmployeeNumber,
  findUserById,
  createUser,
  comparePassword
} = require('../services/auth.service');
const { userToDTO } = require('../dto/user.dto');
const prisma = require('../config/database');

const register = async (req, res, next) => {
  try {
    const { employeeNumber, name, password, role, mobile_number, site_id } = req.body;

    // Check for existing user by employee number
    const existingUser = await findUserByEmployeeNumber(employeeNumber);
    if (existingUser) {
      return next(new AppError('User already exists with this employee number', 400));
    }

    // Create user
    // Find role_id from role name
    const roleRecord = await prisma.roles.findFirst({
      where: { role_name: role }
    });
    if (!roleRecord) {
      return next(new AppError('Invalid role', 400));
    }

    const user = await createUser({
      employee_number: employeeNumber,
      employee_name: name,
      password,
      role_id: roleRecord.role_id,
      mobile_number,
      site_id
    });

    const accessToken = signToken(user.employee_id);
    const refreshToken = signRefreshToken(user.employee_id);

    res.status(201).json({
      status: 'success',
      accessToken,
      refreshToken,
      data: { user: userToDTO(user) }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { employee_number, password } = req.body;

    if (!employee_number || !password) {
      return next(new AppError('Please provide employee number and password', 400));
    }

    const user = await findUserByEmployeeNumber(employee_number);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return next(new AppError('Incorrect employee number or password', 401));
    }

    const accessToken = signToken(user.employee_id);
    const loginRefreshToken = signRefreshToken(user.employee_id);

    res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken: loginRefreshToken,
      data: { user: userToDTO(user) }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token endpoint
const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken: refreshTokenValue } = req.body;
    if (!refreshTokenValue) {
      return next(new AppError('Refresh token required', 400));
    }
    
    let decoded;
    try {
      decoded = jwt.verify(refreshTokenValue, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }
    
    const user = await findUserById(decoded.employee_id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    const accessToken = signToken(user.employee_id);
    
    res.status(200).json({
      status: 'success',
      accessToken,
      data: { user: userToDTO(user) }
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { employee_id: req.user.id },
      include: {
        roles: {
          select: {
            role_name: true,
            role_id: true
          }
        },
        sites: {
          select: {
            site_name: true,
            site_id: true
          }
        }
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user: userToDTO(user) }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    
    const updateData = {};
    if (name) updateData.employee_name = name;

    if (newPassword) {
      if (!currentPassword) {
        return next(new AppError('Please provide your current password', 400));
      }

      const user = await prisma.users.findUnique({
        where: { employee_id: req.user.id }
      });

      if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
        return next(new AppError('Current password is incorrect', 401));
      }

      updateData.password_hash = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await prisma.users.update({
      where: { employee_id: req.user.id },
      data: updateData,
      include: {
        roles: {
          select: {
            role_name: true,
            role_id: true
          }
        },
        sites: {
          select: {
            site_name: true,
            site_id: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: { user: userToDTO(updatedUser) }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just return success
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  refreshTokenHandler,
  logout
};
