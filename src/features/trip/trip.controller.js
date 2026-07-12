const mongoose = require('mongoose');
const Trip = require('./trip.model');
const Vehicle = require('../vehicle/vehicle.model');
const Driver = require('../driver/driver.model');
const FuelLog = require('../fuel/fuel.model');
const {
  validateTripCreation,
  validateDispatch,
  validateComplete,
  validateCancel,
} = require('../../services/businessRules');

// ─── POST /api/trips ────────────────────────────────────────────────────────

const createTrip = async (req, res) => {
  try {
    const {
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight,
      plannedDistance,
      revenue,
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: 'Vehicle not found' });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: 'Driver not found' });
    }

    const check = validateTripCreation(vehicle, driver, cargoWeight);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    const trip = await Trip.create({
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight,
      plannedDistance,
      revenue,
      status: 'Draft',
      createdBy: req.user.id,
    });

    return res.status(201).json({ success: true, data: trip });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || 'Failed to create trip' });
  }
};

// ─── PUT /api/trips/:id/dispatch ─────────────────────────────────────────────

const dispatchTrip = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trip = await Trip.findById(req.params.id).session(session);
    if (!trip) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Trip not found' });
    }

    // State-transition guard
    const transitionCheck = validateDispatch(trip);
    if (!transitionCheck.valid) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: transitionCheck.message });
    }

    // Re-fetch vehicle & driver inside the transaction to get latest status
    const vehicle = await Vehicle.findById(trip.vehicleId).session(session);
    if (!vehicle) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Vehicle not found' });
    }

    const driver = await Driver.findById(trip.driverId).session(session);
    if (!driver) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Driver not found' });
    }

    // Re-run ALL eligibility checks (vehicle/driver may have changed since Draft)
    const eligibilityCheck = validateTripCreation(
      vehicle,
      driver,
      trip.cargoWeight
    );
    if (!eligibilityCheck.valid) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: eligibilityCheck.message });
    }

    // Atomic triple-update
    trip.status = 'Dispatched';
    await trip.save({ session });

    vehicle.status = 'On Trip';
    await vehicle.save({ session });

    driver.status = 'On Trip';
    await driver.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, data: trip });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, message: err.message || 'Failed to dispatch trip' });
  }
};

// ─── PUT /api/trips/:id/complete ─────────────────────────────────────────────

const completeTrip = async (req, res) => {
  try {
    const { actualDistance, fuelConsumed, revenue, fuelCost } = req.body;

    // Validate required completion payload
    if (
      actualDistance == null ||
      fuelConsumed == null ||
      revenue == null ||
      fuelCost == null
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Completion requires actualDistance, fuelConsumed, revenue, and fuelCost',
      });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: 'Trip not found' });
    }

    const transitionCheck = validateComplete(trip);
    if (!transitionCheck.valid) {
      return res
        .status(400)
        .json({ success: false, message: transitionCheck.message });
    }

    const vehicle = await Vehicle.findById(trip.vehicleId);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: 'Vehicle not found' });
    }

    const driver = await Driver.findById(trip.driverId);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: 'Driver not found' });
    }

    // Update trip
    trip.status = 'Completed';
    trip.actualDistance = actualDistance;
    trip.fuelConsumed = fuelConsumed;
    trip.revenue = revenue;
    await trip.save();

    // Restore vehicle & update odometer
    vehicle.status = 'Available';
    vehicle.odometer += actualDistance;
    await vehicle.save();

    // Restore driver
    driver.status = 'Available';
    await driver.save();

    // Auto-create FuelLog (required for cost aggregation reports)
    await FuelLog.create({
      vehicleId: trip.vehicleId,
      tripId: trip._id,
      liters: fuelConsumed,
      cost: fuelCost,
      date: new Date(),
    });

    return res.status(200).json({ success: true, data: trip });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || 'Failed to complete trip' });
  }
};

// ─── PUT /api/trips/:id/cancel ───────────────────────────────────────────────

const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: 'Trip not found' });
    }

    const transitionCheck = validateCancel(trip);
    if (!transitionCheck.valid) {
      return res
        .status(400)
        .json({ success: false, message: transitionCheck.message });
    }

    const vehicle = await Vehicle.findById(trip.vehicleId);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: 'Vehicle not found' });
    }

    const driver = await Driver.findById(trip.driverId);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: 'Driver not found' });
    }

    // Restore statuses
    trip.status = 'Cancelled';
    await trip.save();

    vehicle.status = 'Available';
    await vehicle.save();

    driver.status = 'Available';
    await driver.save();

    return res.status(200).json({ success: true, data: trip });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || 'Failed to cancel trip' });
  }
};

// ─── GET /api/trips ──────────────────────────────────────────────────────────

const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('vehicleId', 'registrationNumber name model')
      .populate('driverId', 'name licenseNumber')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: trips });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || 'Failed to fetch trips' });
  }
};

// ─── GET /api/trips/:id ─────────────────────────────────────────────────────

const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicleId', 'registrationNumber name model')
      .populate('driverId', 'name licenseNumber')
      .populate('createdBy', 'name email');

    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: 'Trip not found' });
    }

    return res.status(200).json({ success: true, data: trip });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || 'Failed to fetch trip' });
  }
};

module.exports = {
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  getTrips,
  getTripById,
};
