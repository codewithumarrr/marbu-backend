// src/routes/sites.routes.js

const express = require('express');
const {
  createSite,
  getAllSites,
  getSiteById,
  updateSite,
  deleteSite
} = require('../controllers/sites.controller');

const router = express.Router();

router.post('/', createSite);
router.get('/', getAllSites);
router.get('/:id', getSiteById);
router.put('/:id', updateSite);
router.delete('/:id', deleteSite);

module.exports = router;