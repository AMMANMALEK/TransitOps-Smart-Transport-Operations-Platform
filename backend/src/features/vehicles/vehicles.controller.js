const Vehicle = require('./vehicle.model');

// Get all vehicles with optional filters
exports.getVehicles = async (req, res, next) => {
  try {
    const { status, type, region } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }
    if (region) {
      filter.region = region;
    }

    const vehicles = await Vehicle.find(filter);
    return res.json({ count: vehicles.length, vehicles });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching vehicles.' });
  }
};

// Get single vehicle by ID
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.json({ vehicle });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while retrieving the vehicle.' });
  }
};

// Create a new vehicle (FleetManager, Admin only)
exports.createVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, name, model, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;

    if (!registrationNumber || !name || !model || !type || maxLoadCapacity === undefined || odometer === undefined || acquisitionCost === undefined) {
      return res.status(400).json({ error: 'Missing required vehicle fields' });
    }

    // Explicit unique check
    const existingVehicle = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase().trim() });
    if (existingVehicle) {
      return res.status(409).json({ error: `Vehicle with registration number '${registrationNumber}' already exists.` });
    }

    const vehicle = new Vehicle({
      registrationNumber: registrationNumber.toUpperCase().trim(),
      name,
      model,
      type,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      status: status || 'Available',
      region
    });

    await vehicle.save();
    return res.status(201).json({ message: 'Vehicle created successfully', vehicle });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(error);
    }
    return res.status(500).json({ error: 'An error occurred while creating the vehicle.' });
  }
};

// Update an existing vehicle (FleetManager, Admin only)
exports.updateVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, name, model, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;
    
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check unique registration number if changed
    if (registrationNumber && registrationNumber.toUpperCase().trim() !== vehicle.registrationNumber) {
      const existingVehicle = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase().trim() });
      if (existingVehicle) {
        return res.status(409).json({ error: `Vehicle with registration number '${registrationNumber}' already exists.` });
      }
      vehicle.registrationNumber = registrationNumber.toUpperCase().trim();
    }

    if (name) vehicle.name = name;
    if (model) vehicle.model = model;
    if (type) vehicle.type = type;
    if (maxLoadCapacity !== undefined) vehicle.maxLoadCapacity = maxLoadCapacity;
    if (odometer !== undefined) vehicle.odometer = odometer;
    if (acquisitionCost !== undefined) vehicle.acquisitionCost = acquisitionCost;
    if (status) vehicle.status = status;
    if (region !== undefined) vehicle.region = region;

    await vehicle.save();
    return res.json({ message: 'Vehicle updated successfully', vehicle });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(error);
    }
    return res.status(500).json({ error: 'An error occurred while updating the vehicle.' });
  }
};

// Delete a vehicle (FleetManager, Admin only)
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the vehicle.' });
  }
};
