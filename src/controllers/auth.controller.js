const bcrypt = require('bcryptjs');
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
  refreshToken: loginRefreshToken
});
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
    const user = await findUserById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    const accessToken = signToken(user.id);
    res.status(200).json({
      status: 'success',
      accessToken
    });
  } catch (error) {
    next(error);
  }
};
    const refreshToken = signRefreshToken(user.id);

    res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken
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
      decoded = require('jsonwebtoken').verify(
        refreshTokenValue,
        process.env.JWT_REFRESH_SECRET
      );
    } catch (err) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }
    const user = await findUserById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    const accessToken = signToken(user.id);
    res.status(200).json({
      status: 'success',
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        employeeNumber: true,
        name: true,
        role: true
      }
    });

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
    if (name) updateData.name = name;

    if (newPassword) {
      if (!currentPassword) {
        return next(new AppError('Please provide your current password', 400));
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return next(new AppError('Current password is incorrect', 401));
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        employeeNumber: true,
        name: true,
        role: true
      }
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
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
  refreshTokenHandler
};