// src/routes/users.routes.js

const express = require('express');
const joiValidate = require('../middleware/joiValidate');
const { createUserSchema, updateUserSchema } = require('../validation/user.validation');
const { requireRole } = require('../utils/roleUtils');
const { protect } = require('../middleware/auth');
const {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmployeeNumber,
  updateUser,
  deleteUser,
  uploadUserPicture
} = require('../controllers/users.controller');

const router = express.Router();

// Public route for getting user by employee number (needed for auto-fill)
router.get('/employee/:employeeNumber', protect, getUserByEmployeeNumber);

router.use(protect, requireRole('admin'));

router.post('/', uploadUserPicture, joiValidate(createUserSchema), createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', uploadUserPicture, joiValidate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
