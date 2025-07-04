const express = require('express');
const { protect } = require('../middleware/auth');
const joiValidate = require('../middleware/joiValidate');
const { registerSchema, loginSchema } = require('../validation/auth.validation');
const { requireRole } = require('../utils/roleUtils');
const {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  uploadRegisterPicture,
  register,
  login,
  getProfile,
  updateProfile,
  refreshTokenHandler,
  logout
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', protect, requireRole('admin'), uploadRegisterPicture, joiValidate(registerSchema), register);
router.post('/login', joiValidate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);

router.post('/refresh-token', refreshTokenHandler);

router.get('/generate-authentication-options', protect, generateAuthenticationOptions);
router.post('/verify-authentication-response', protect, verifyAuthenticationResponse);

module.exports = router;
