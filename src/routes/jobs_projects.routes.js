// src/routes/jobs_projects.routes.js

const express = require('express');
const joiValidate = require('../middleware/joiValidate');
const { createJobProjectSchema, updateJobProjectSchema } = require('../validation/jobs_projects.validation');
const {
  createJobProject,
  getAllJobsProjects,
  getJobProjectById,
  updateJobProject,
  deleteJobProject
} = require('../controllers/jobs_projects.controller');

const router = express.Router();

router.post('/', joiValidate(createJobProjectSchema), createJobProject);
router.get('/', getAllJobsProjects);
router.get('/:id', getJobProjectById);
router.put('/:id', joiValidate(updateJobProjectSchema), updateJobProject);
router.delete('/:id', deleteJobProject);

module.exports = router;