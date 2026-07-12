const express = require('express');
const router = express.Router();
const driversController = require('./drivers.controller');
const { authenticateJWT } = require('../../middleware/auth');

// All routes — any authenticated user (open access per ROLE_ACCESS.md)
router.get('/', authenticateJWT, driversController.getDrivers);
router.get('/:id', authenticateJWT, driversController.getDriverById);
router.post('/', authenticateJWT, driversController.createDriver);
router.put('/:id', authenticateJWT, driversController.updateDriver);
router.delete('/:id', authenticateJWT, driversController.deleteDriver);

module.exports = router;
