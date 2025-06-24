# Marbu System

A comprehensive fleet management system built with Node.js, Express, and PostgreSQL. This system handles vehicle tracking, maintenance scheduling, fuel management, and more.

## Features

- 🚗 Complete vehicle lifecycle management
- 🔧 Maintenance tracking and scheduling
- ⛽ Fuel consumption monitoring
- 🚦 Vehicle assignment and status tracking
- 🛠 Parts inventory management
- 👥 Driver management and assignments
- 📊 Comprehensive reporting and analytics
- 🔐 Role-based access control

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd fleet-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file:
```bash
cp .env.example .env
```
Update the environment variables with your configuration.

4. Set up the database:
```bash
npm run db:migrate
npm run db:seed  # Optional: Add sample data
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/v1/auth/register - Register a new user
- POST /api/v1/auth/login - User login
- GET /api/v1/auth/profile - Get user profile
- PATCH /api/v1/auth/profile - Update user profile

### Vehicle Management
- POST /api/v1/vehicles - Create a new vehicle
- GET /api/v1/vehicles - List all vehicles
- GET /api/v1/vehicles/:id - Get vehicle details
- PATCH /api/v1/vehicles/:id - Update vehicle details
- POST /api/v1/vehicles/assign/:vehicleId - Assign vehicle to driver
- POST /api/v1/vehicles/return/:vehicleId - Return vehicle from assignment

### Maintenance
- POST /api/v1/vehicles/maintenance - Record maintenance
- GET /api/v1/vehicles/maintenance/:vehicleId - Get maintenance history
- POST /api/v1/vehicles/tires - Add tire record
- GET /api/v1/vehicles/tires/:vehicleId - Get vehicle tire records

### Fuel Management
- POST /api/v1/vehicles/fuel - Record fuel consumption
- GET /api/v1/vehicles/fuel/:vehicleId - Get fuel history
- GET /api/v1/vehicles/stats - Get vehicle statistics

## Project Structure

```
fleet-management-system/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── app.js
│   └── server.js
├── .env
├── .env.example
├── .gitignore
└── package.json
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database
- `npm run db:reset` - Reset the database
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues

## Environment Variables

Key environment variables:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/fleet_management
JWT_SECRET=your-secret-key
```

See `.env.example` for all available options.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the GitHub repository.# marbu-backend
