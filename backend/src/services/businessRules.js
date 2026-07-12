const mongoose = require('mongoose');
const Vehicle = require('../features/vehicles/vehicle.model');
const Driver = require('../features/drivers/driver.model');
const FuelLog = require('../features/finance/fuelLog.model');
const MaintenanceLog = require('../features/maintenance/maintenanceLog.model');

/**
 * Validates vehicle and driver eligibility for a trip assignment/dispatch.
 * @param {Object} vehicle - Vehicle Mongoose document
 * @param {Object} driver - Driver Mongoose document
 * @param {Number} cargoWeight - Weight of the cargo
 * @returns {Object} { valid: boolean, reason?: string }
 */
const validateAssignment = (vehicle, driver, cargoWeight) => {
  // 1. Vehicle status checks
  if (['Retired', 'In Shop'].includes(vehicle.status)) {
    return { valid: false, reason: `Vehicle is currently ${vehicle.status} and cannot be dispatched.` };
  }
  if (vehicle.status === 'On Trip') {
    return { valid: false, reason: 'Vehicle is already assigned to an active trip.' };
  }

  // 2. Driver status checks
  if (driver.status === 'Suspended') {
    return { valid: false, reason: 'Driver status is Suspended and cannot be assigned to trips.' };
  }
  if (driver.status === 'On Trip') {
    return { valid: false, reason: 'Driver is already on an active trip.' };
  }

  // 3. Driver license expiry check
  const now = new Date();
  if (new Date(driver.licenseExpiryDate) <= now) {
    return { valid: false, reason: 'Driver license has expired.' };
  }

  // 4. Cargo weight limit check
  if (cargoWeight > vehicle.maxLoadCapacity) {
    return { valid: false, reason: `Cargo weight (${cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxLoadCapacity} kg).` };
  }

  return { valid: true };
};

/**
 * Handles Trip creation validation
 */
const validateTripCreation = async (vehicleId, driverId, cargoWeight) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return { valid: false, reason: 'Vehicle not found' };
  }

  const driver = await Driver.findById(driverId);
  if (!driver) {
    return { valid: false, reason: 'Driver not found' };
  }

  // At creation of Draft, we run the validations, but status checks (like already on trip)
  // are warnings or validation blocks depending on business requirements. The requirements say:
  // "A driver or vehicle already 'On Trip' cannot be assigned to another trip. Drivers with expired licenses or Suspended status cannot be assigned to trips."
  // So we run the validations here too.
  return validateAssignment(vehicle, driver, cargoWeight);
};

/**
 * Dispatches a trip, updating statuses to "On Trip".
 * Uses a Mongoose transaction so vehicle + driver + trip update atomically.
 */
const dispatchTrip = async (trip) => {
  // Validate trip status transition
  if (trip.status !== 'Draft') {
    throw new Error(`Invalid status transition: Cannot dispatch a trip in '${trip.status}' status. Must be in 'Draft'.`);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch fresh vehicle and driver documents inside the transaction
    const vehicle = await Vehicle.findById(trip.vehicleId).session(session);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const driver = await Driver.findById(trip.driverId).session(session);
    if (!driver) {
      throw new Error('Driver not found');
    }

    // Re-run all business rules to prevent stale data dispatch conflicts
    const validation = validateAssignment(vehicle, driver, trip.cargoWeight);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // Apply state transitions atomically
    vehicle.status = 'On Trip';
    driver.status = 'On Trip';
    trip.status = 'Dispatched';

    await vehicle.save({ session });
    await driver.save({ session });
    await trip.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { trip, vehicle, driver };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Completes a dispatched trip, updating vehicle/driver to "Available", increments odometer, and logs fuel
 */
const completeTrip = async (trip, payload) => {
  // Validate trip status transition
  if (trip.status !== 'Dispatched') {
    throw new Error(`Invalid status transition: Cannot complete a trip in '${trip.status}' status. Must be in 'Dispatched'.`);
  }

  const { actualDistance, fuelConsumed, revenue, fuelCost } = payload;

  if (actualDistance === undefined || fuelConsumed === undefined || revenue === undefined || fuelCost === undefined) {
    throw new Error('Missing required fields for completion: actualDistance, fuelConsumed, revenue, fuelCost');
  }

  const vehicle = await Vehicle.findById(trip.vehicleId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  const driver = await Driver.findById(trip.driverId);
  if (!driver) {
    throw new Error('Driver not found');
  }

  // Apply state transitions
  vehicle.status = 'Available';
  vehicle.odometer += Number(actualDistance);
  
  driver.status = 'Available';

  trip.status = 'Completed';
  trip.actualDistance = Number(actualDistance);
  trip.fuelConsumed = Number(fuelConsumed);
  trip.revenue = Number(revenue);

  // Auto-generate FuelLog entry
  const fuelLog = new FuelLog({
    vehicleId: vehicle._id,
    tripId: trip._id,
    liters: Number(fuelConsumed),
    cost: Number(fuelCost),
    date: new Date()
  });

  // Save all operations
  await vehicle.save();
  await driver.save();
  await trip.save();
  await fuelLog.save();

  return { trip, vehicle, driver, fuelLog };
};

/**
 * Cancels a dispatched trip, restoring vehicle/driver statuses to "Available"
 */
const cancelTrip = async (trip) => {
  // Validate trip status transition
  if (trip.status !== 'Dispatched') {
    throw new Error(`Invalid status transition: Cannot cancel a trip in '${trip.status}' status. Must be in 'Dispatched'.`);
  }

  const vehicle = await Vehicle.findById(trip.vehicleId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  const driver = await Driver.findById(trip.driverId);
  if (!driver) {
    throw new Error('Driver not found');
  }

  // Restore statuses
  vehicle.status = 'Available';
  driver.status = 'Available';
  trip.status = 'Cancelled';

  await vehicle.save();
  await driver.save();
  await trip.save();

  return { trip, vehicle, driver };
};

/**
 * Starts a maintenance record, updating vehicle to "In Shop"
 */
const startMaintenance = async (maintenanceData) => {
  const { vehicleId, description, cost, startDate } = maintenanceData;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  // Block maintenance creation if vehicle is currently On Trip
  if (vehicle.status === 'On Trip') {
    throw new Error('Cannot create maintenance for a vehicle that is currently on a trip.');
  }

  // Set vehicle status to "In Shop"
  vehicle.status = 'In Shop';
  await vehicle.save();

  const log = new MaintenanceLog({
    vehicleId,
    description,
    cost,
    startDate: startDate || new Date(),
    status: 'Active'
  });

  await log.save();

  return { log, vehicle };
};

/**
 * Closes maintenance, restoring vehicle status to "Available" (unless Retired)
 */
const closeMaintenance = async (maintenanceLogId, endDate) => {
  const log = await MaintenanceLog.findById(maintenanceLogId);
  if (!log) {
    throw new Error('Maintenance log not found');
  }

  if (log.status === 'Closed') {
    throw new Error('Maintenance log is already closed');
  }

  const vehicle = await Vehicle.findById(log.vehicleId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  // Update log status
  log.status = 'Closed';
  log.endDate = endDate || new Date();
  await log.save();

  // Restore vehicle status (unless it has been Retired in the meantime)
  if (vehicle.status !== 'Retired') {
    vehicle.status = 'Available';
    await vehicle.save();
  }

  return { log, vehicle };
};

module.exports = {
  validateAssignment,
  validateTripCreation,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  startMaintenance,
  closeMaintenance
};
