const express = require('express');
const router = express.Router();
const maintenanceController = require('./maintenance.controller');
const { authenticateJWT } = require('../../middleware/auth');

// All routes — any authenticated user (open access per ROLE_ACCESS.md)
router.get('/', authenticateJWT, maintenanceController.getMaintenanceLogs);
router.post('/', authenticateJWT, maintenanceController.createMaintenanceLog);
router.put('/:id/close', authenticateJWT, maintenanceController.closeMaintenanceLog);

module.exports = router;
