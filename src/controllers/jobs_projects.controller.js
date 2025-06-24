// src/controllers/jobs_projects.controller.js

const prisma = require('../config/database');

// Create a new job/project
exports.createJobProject = async (req, res, next) => {
  try {
    const jobProject = await prisma.jobs_projects.create({
      data: req.body,
    });
    res.status(201).json(jobProject);
  } catch (error) {
    next(error);
  }
};

// Get all jobs/projects
exports.getAllJobsProjects = async (req, res, next) => {
  try {
    const jobsProjects = await prisma.jobs_projects.findMany();
    res.json(jobsProjects);
  } catch (error) {
    next(error);
  }
};

// Get job/project by ID
exports.getJobProjectById = async (req, res, next) => {
  try {
    const jobProject = await prisma.jobs_projects.findUnique({
      where: { job_id: parseInt(req.params.id) },
    });
    if (!jobProject) return res.status(404).json({ message: 'Job/Project not found' });
    res.json(jobProject);
  } catch (error) {
    next(error);
  }
};

// Update job/project by ID
exports.updateJobProject = async (req, res, next) => {
  try {
    const jobProject = await prisma.jobs_projects.update({
      where: { job_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(jobProject);
  } catch (error) {
    next(error);
  }
};

// Delete job/project by ID
exports.deleteJobProject = async (req, res, next) => {
  try {
    await prisma.jobs_projects.delete({
      where: { job_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};