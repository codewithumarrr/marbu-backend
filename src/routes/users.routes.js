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
  updateUser,
  deleteUser
} = require('../controllers/users.controller');

const router = express.Router();

router.use(protect, requireRole('admin'));

router.post('/', joiValidate(createUserSchema), createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', joiValidate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

module.exports = router;