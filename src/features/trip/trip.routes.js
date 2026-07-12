const express = require('express');
const router = express.Router();
const {
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  getTrips,
  getTripById,
} = require('./trip.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');

// Create a new trip (Draft)
router.post(
  '/',
  verifyToken,
  authorizeRoles('FleetManager', 'Driver', 'Admin'),
  createTrip
);

// Dispatch a trip (Draft → Dispatched)
router.put(
  '/:id/dispatch',
  verifyToken,
  authorizeRoles('FleetManager', 'Driver', 'Admin'),
  dispatchTrip
);

// Complete a trip (Dispatched → Completed)
router.put(
  '/:id/complete',
  verifyToken,
  authorizeRoles('FleetManager', 'Driver', 'Admin'),
  completeTrip
);

// Cancel a trip (Dispatched → Cancelled)
router.put(
  '/:id/cancel',
  verifyToken,
  authorizeRoles('FleetManager', 'Driver', 'Admin'),
  cancelTrip
);

// List all trips
router.get('/', verifyToken, getTrips);

// Get single trip by ID
router.get('/:id', verifyToken, getTripById);

module.exports = router;
