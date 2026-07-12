const express = require('express');
const router = express.Router();
const tripsController = require('./trips.controller');
const { authenticateJWT } = require('../../middleware/auth');

// All routes — any authenticated user (open access per ROLE_ACCESS.md)
router.get('/', authenticateJWT, tripsController.getTrips);
router.get('/:id', authenticateJWT, tripsController.getTripById);
router.post('/', authenticateJWT, tripsController.createTrip);
router.put('/:id/dispatch', authenticateJWT, tripsController.dispatchTrip);
router.put('/:id/complete', authenticateJWT, tripsController.completeTrip);
router.put('/:id/cancel', authenticateJWT, tripsController.cancelTrip);

module.exports = router;
