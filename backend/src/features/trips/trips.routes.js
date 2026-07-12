const express = require('express');
const router = express.Router();
const tripsController = require('./trips.controller');
const { authenticateJWT, checkRole } = require('../../middleware/auth');

// Protected GET routes (accessible by any logged-in user)
router.get('/', authenticateJWT, tripsController.getTrips);
router.get('/:id', authenticateJWT, tripsController.getTripById);

// Restricted write/modify routes (restricted to Admin, FleetManager, and Driver)
router.post('/', authenticateJWT, checkRole('Admin', 'FleetManager', 'Driver'), tripsController.createTrip);
router.put('/:id/dispatch', authenticateJWT, checkRole('Admin', 'FleetManager', 'Driver'), tripsController.dispatchTrip);
router.put('/:id/complete', authenticateJWT, checkRole('Admin', 'FleetManager', 'Driver'), tripsController.completeTrip);
router.put('/:id/cancel', authenticateJWT, checkRole('Admin', 'FleetManager', 'Driver'), tripsController.cancelTrip);

module.exports = router;
