// src/routes/sites.routes.js

const express = require('express');
const joiValidate = require('../middleware/joiValidate');
const { createSiteSchema, updateSiteSchema } = require('../validation/site.validation');
const { requireRole } = require('../utils/roleUtils');
const { protect } = require('../middleware/auth');
const {
  createSite,
  getAllSites,
  getSiteById,
  updateSite,
  deleteSite
} = require('../controllers/sites.controller');

const router = express.Router();

router.use(protect, requireRole('admin', 'site-manager'));

router.post('/', joiValidate(createSiteSchema), createSite);
router.get('/', getAllSites);
router.get('/:id', getSiteById);
router.put('/:id', joiValidate(updateSiteSchema), updateSite);
router.delete('/:id', deleteSite);

module.exports = router;