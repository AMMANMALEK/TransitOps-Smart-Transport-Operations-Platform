const Trip = require('./trip.model');
const businessRules = require('../../services/businessRules');

// Get all trips with optional filters
exports.getTrips = async (req, res, next) => {
  try {
    const { driverId, vehicleId, status } = req.query;
    const filter = {};

    if (driverId) {
      filter.driverId = driverId;
    }
    if (vehicleId) {
      filter.vehicleId = vehicleId;
    }
    if (status) {
      filter.status = status;
    }

    const trips = await Trip.find(filter)
      .populate('vehicleId', 'registrationNumber name model')
      .populate('driverId', 'name licenseNumber')
      .populate('createdBy', 'name email role');
    return res.json({ count: trips.length, trips });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while retrieving trips.' });
  }
};

// Get trip by ID
exports.getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicleId', 'registrationNumber name model')
      .populate('driverId', 'name licenseNumber')
      .populate('createdBy', 'name email role');
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    return res.json({ trip });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while retrieving the trip.' });
  }
};

// Create a trip (Draft status by default)
exports.createTrip = async (req, res, next) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue } = req.body;

    if (!source || !destination || !vehicleId || !driverId || cargoWeight === undefined || plannedDistance === undefined) {
      return res.status(400).json({ error: 'Missing required trip fields' });
    }

    // Run business validation checks
    const validation = await businessRules.validateTripCreation(vehicleId, driverId, cargoWeight);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason });
    }

    const trip = new Trip({
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight,
      plannedDistance,
      revenue: revenue !== undefined ? revenue : null, // Optional at creation
      status: 'Draft',
      createdBy: req.user.id
    });

    await trip.save();
    return res.status(201).json({ message: 'Trip created successfully as Draft', trip });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(error);
    }
    return res.status(500).json({ error: 'An error occurred while creating the trip.' });
  }
};

// Dispatch a trip (updates statuses to "On Trip")
exports.dispatchTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Perform dispatch state transition via businessRules service
    const result = await businessRules.dispatchTrip(trip);
    
    return res.json({
      message: 'Trip dispatched successfully. Vehicle and driver status set to On Trip.',
      trip: result.trip
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to dispatch the trip.' });
  }
};

// Complete a trip (takes final odometer and fuel logs, updates statuses to "Available")
exports.completeTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const { actualDistance, fuelConsumed, revenue, fuelCost } = req.body;

    if (actualDistance === undefined || fuelConsumed === undefined || revenue === undefined || fuelCost === undefined) {
      return res.status(400).json({ error: 'Missing required fields for completion: actualDistance, fuelConsumed, revenue, fuelCost' });
    }

    // Perform complete state transition via businessRules service
    const result = await businessRules.completeTrip(trip, {
      actualDistance,
      fuelConsumed,
      revenue,
      fuelCost
    });

    return res.json({
      message: 'Trip completed successfully. Vehicle and driver status set to Available.',
      trip: result.trip,
      fuelLog: result.fuelLog
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to complete the trip.' });
  }
};

// Cancel a dispatched trip (returns statuses to "Available")
exports.cancelTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Perform cancel state transition via businessRules service
    const result = await businessRules.cancelTrip(trip);

    return res.json({
      message: 'Trip cancelled successfully. Vehicle and driver status set to Available.',
      trip: result.trip
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to cancel the trip.' });
  }
};
