const express = require('express');
const router = express.Router();
const driversController = require('./drivers.controller');
const { authenticateJWT, checkRole } = require('../../middleware/auth');

// Protected GET routes (accessible by any logged-in user)
router.get('/', authenticateJWT, driversController.getDrivers);
router.get('/:id', authenticateJWT, driversController.getDriverById);

// Restricted write/modify routes (restricted to Admin, FleetManager, and SafetyOfficer)
router.post('/', authenticateJWT, checkRole('Admin', 'FleetManager', 'SafetyOfficer'), driversController.createDriver);
router.put('/:id', authenticateJWT, checkRole('Admin', 'FleetManager', 'SafetyOfficer'), driversController.updateDriver);

// Restricted DELETE route (restricted to Admin and FleetManager only - SafetyOfficer excluded)
router.delete('/:id', authenticateJWT, checkRole('Admin', 'FleetManager'), driversController.deleteDriver);

module.exports = router;
