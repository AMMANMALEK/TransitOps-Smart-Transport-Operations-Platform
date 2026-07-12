const express = require('express');
const cors = require('cors');
const authRoutes = require('./features/auth/auth.routes');
const vehiclesRoutes = require('./features/vehicles/vehicles.routes');
const driversRoutes = require('./features/drivers/drivers.routes');
const tripsRoutes = require('./features/trips/trips.routes');
const maintenanceRoutes = require('./features/maintenance/maintenance.routes');
const financeRoutes = require('./features/finance/finance.routes');
const reportsRoutes = require('./features/reports/reports.routes');
const errorHandler = require('./middleware/error');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Feature routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/reports', reportsRoutes);

// Root route for health check
app.get('/health', (req, res) => {
  return res.json({ status: 'OK', message: 'TransitOps Backend Service is running' });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
