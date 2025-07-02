// src/routes/divisions.routes.js

const express = require('express');
const router = express.Router();
const divisionsController = require('../controllers/divisions.controller');

// GET all divisions
router.get('/', divisionsController.getAllDivisions);

// POST create division
router.post('/', divisionsController.createDivision);

// PUT update division
router.put('/:id', divisionsController.updateDivision);

// DELETE division
router.delete('/:id', divisionsController.deleteDivision);

module.exports = router;