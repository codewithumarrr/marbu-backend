// src/controllers/sites.controller.js

const prisma = require('../config/database');

// Create a new site
exports.createSite = async (req, res, next) => {
  try {
    const site = await prisma.sites.create({
      data: req.body,
    });
    res.status(201).json(site);
  } catch (error) {
    next(error);
  }
};

// Get all sites
exports.getAllSites = async (req, res, next) => {
  try {
    const sites = await prisma.sites.findMany();
    res.json(sites);
  } catch (error) {
    next(error);
  }
};

// Get site by ID
exports.getSiteById = async (req, res, next) => {
  try {
    const site = await prisma.sites.findUnique({
      where: { site_id: parseInt(req.params.id) },
    });
    if (!site) return res.status(404).json({ message: 'Site not found' });
    res.json(site);
  } catch (error) {
    next(error);
  }
};

// Update site by ID
exports.updateSite = async (req, res, next) => {
  try {
    const site = await prisma.sites.update({
      where: { site_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(site);
  } catch (error) {
    next(error);
  }
};

// Delete site by ID
exports.deleteSite = async (req, res, next) => {
  try {
    await prisma.sites.delete({
      where: { site_id: parseInt(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};