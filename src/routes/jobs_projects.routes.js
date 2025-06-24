// src/routes/jobs_projects.routes.js

const express = require('express');
const {
  createJobProject,
  getAllJobsProjects,
  getJobProjectById,
  updateJobProject,
  deleteJobProject
} = require('../controllers/jobs_projects.controller');

const router = express.Router();

router.post('/', createJobProject);
router.get('/', getAllJobsProjects);
router.get('/:id', getJobProjectById);
router.put('/:id', updateJobProject);
router.delete('/:id', deleteJobProject);

module.exports = router;