const express = require('express');
const router = express.Router();
const maintenanceController = require('./maintenance.controller');
const { authenticateJWT, checkRole } = require('../../middleware/auth');

// Protected GET route (accessible by any logged-in user)
router.get('/', authenticateJWT, maintenanceController.getMaintenanceLogs);

// Restricted write/modify routes (restricted to Admin, FleetManager, and SafetyOfficer)
router.post('/', authenticateJWT, checkRole('Admin', 'FleetManager', 'SafetyOfficer'), maintenanceController.createMaintenanceLog);
router.put('/:id/close', authenticateJWT, checkRole('Admin', 'FleetManager', 'SafetyOfficer'), maintenanceController.closeMaintenanceLog);

module.exports = router;
