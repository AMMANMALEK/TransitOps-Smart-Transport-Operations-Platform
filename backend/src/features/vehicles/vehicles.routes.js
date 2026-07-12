const express = require('express');
const router = express.Router();
const vehiclesController = require('./vehicles.controller');
const { authenticateJWT } = require('../../middleware/auth');

// All routes — any authenticated user (open access per ROLE_ACCESS.md)
router.get('/', authenticateJWT, vehiclesController.getVehicles);
router.get('/:id', authenticateJWT, vehiclesController.getVehicleById);
router.post('/', authenticateJWT, vehiclesController.createVehicle);
router.put('/:id', authenticateJWT, vehiclesController.updateVehicle);
router.delete('/:id', authenticateJWT, vehiclesController.deleteVehicle);

module.exports = router;
