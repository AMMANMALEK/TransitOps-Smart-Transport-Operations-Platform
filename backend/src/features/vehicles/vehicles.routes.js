const express = require('express');
const router = express.Router();
const vehiclesController = require('./vehicles.controller');
const { authenticateJWT, checkRole } = require('../../middleware/auth');

// Protected GET routes (accessible by any logged-in user)
router.get('/', authenticateJWT, vehiclesController.getVehicles);
router.get('/:id', authenticateJWT, vehiclesController.getVehicleById);

// Restricted modify routes (restricted to Admin and FleetManager)
router.post('/', authenticateJWT, checkRole('Admin', 'FleetManager'), vehiclesController.createVehicle);
router.put('/:id', authenticateJWT, checkRole('Admin', 'FleetManager'), vehiclesController.updateVehicle);
router.delete('/:id', authenticateJWT, checkRole('Admin', 'FleetManager'), vehiclesController.deleteVehicle);

module.exports = router;
