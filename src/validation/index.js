// src/validation/index.js

const { registerSchema, loginSchema } = require('./auth.validation');

module.exports = {
  auth: {
    register: registerSchema,
    login: loginSchema,
  },
  // Add more modules here as needed
};