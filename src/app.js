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
  max: 10000, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for Swagger UI
}));

// Configure CORS for production - Allow all origins temporarily to fix CORS issue
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
setupLogger(app);

// Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.options('*', cors(corsOptions));
// API Routes
app.get('/', (req, res) => res.json({ message: 'Welcome to the API' }));
app.use('/api/v1', apiLimiter, routes);


// Serve uploads directory as static files
const path = require('path');
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, '../uploads'))
);

// Error handling
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads/')) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  }
  next();
});
app.use(errorHandler);

module.exports = app;