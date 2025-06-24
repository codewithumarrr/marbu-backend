const express = require('express');
const { protect } = require('../middleware/auth');
const { validate, registerValidation, loginValidation } = require('../middleware/validate');
const { requireRole } = require('../utils/roleUtils');
const {
  register,
  login,
  getProfile,
  updateProfile,
  refreshTokenHandler
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', protect, requireRole('admin'), validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);

router.post('/refresh-token', refreshTokenHandler);

module.exports = router;