require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const { setupLogger } = require('./utils/logger');
// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const app = express();
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
setupLogger(app);

// Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.get('/', (req, res) => res.json({ message: 'Welcome to the API' }));
app.use('/api/v1', apiLimiter, routes);


// Error handling
app.use(errorHandler);

module.exports = app;