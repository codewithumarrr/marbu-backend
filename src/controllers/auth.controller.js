const { AppError } = require('../middleware/errorHandler');
const {
  signToken,
  signRefreshToken,
  findUserByEmail,
  findUserById,
  createUser,
  comparePassword
} = require('../services/auth.service');
const { userToDTO } = require('../dto/user.dto');


const register = async (req, res, next) => {
  try {
    const { employeeNumber, name, email, password, role } = req.body;

    // Check for existing user by email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Create user
    const user = await createUser({
      employeeNumber,
      name,
      email,
      password,
      role
    });

    const accessToken = signToken(user.id);
    const refreshToken = signRefreshToken(user.id);

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
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const accessToken = signToken(user.id);
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
        email: true,
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
    const { name, email, currentPassword, newPassword } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

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
        email: true,
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