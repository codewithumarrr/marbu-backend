// src/utils/logger.js

const morgan = require('morgan');

function setupLogger(app) {
  app.use(morgan('combined'));
}

module.exports = { setupLogger };