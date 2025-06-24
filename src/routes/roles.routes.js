// src/routes/roles.routes.js

const express = require('express');
const joiValidate = require('../middleware/joiValidate');
const { createRoleSchema, updateRoleSchema } = require('../validation/role.validation');
const { requireRole } = require('../utils/roleUtils');
const { protect } = require('../middleware/auth');
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
} = require('../controllers/roles.controller');

const router = express.Router();

router.use(protect, requireRole('admin'));

router.post('/', joiValidate(createRoleSchema), createRole);
router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.put('/:id', joiValidate(updateRoleSchema), updateRole);
router.delete('/:id', deleteRole);

module.exports = router;