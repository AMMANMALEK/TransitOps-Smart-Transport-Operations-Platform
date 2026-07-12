const Driver = require('./driver.model');

// Get all drivers with optional status and region filters
exports.getDrivers = async (req, res, next) => {
  try {
    const { status, region } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (region) {
      filter.region = region;
    }

    const drivers = await Driver.find(filter);
    return res.json({ count: drivers.length, drivers });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching drivers.' });
  }
};

// Get single driver by ID
exports.getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    return res.json({ driver });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while retrieving the driver.' });
  }
};

// Create driver profile (Admin, FleetManager, SafetyOfficer only)
exports.createDriver = async (req, res, next) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, region } = req.body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
      return res.status(400).json({ error: 'Missing required driver profile fields' });
    }

    // Explicit unique check
    const existingDriver = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase().trim() });
    if (existingDriver) {
      return res.status(400).json({ error: `Driver with license number '${licenseNumber}' already exists.` });
    }

    const driver = new Driver({
      name,
      licenseNumber: licenseNumber.toUpperCase().trim(),
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: safetyScore !== undefined ? safetyScore : 100,
      status: status || 'Available',
      region
    });

    await driver.save();
    return res.status(201).json({ message: 'Driver created successfully', driver });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(error);
    }
    return res.status(500).json({ error: 'An error occurred while creating the driver.' });
  }
};

// Update driver details (Admin, FleetManager, SafetyOfficer only)
exports.updateDriver = async (req, res, next) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, region } = req.body;

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Check unique license number if modified
    if (licenseNumber && licenseNumber.toUpperCase().trim() !== driver.licenseNumber) {
      const existingDriver = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase().trim() });
      if (existingDriver) {
        return res.status(400).json({ error: `Driver with license number '${licenseNumber}' already exists.` });
      }
      driver.licenseNumber = licenseNumber.toUpperCase().trim();
    }

    // Apply updates
    if (name) driver.name = name;
    if (licenseCategory) driver.licenseCategory = licenseCategory;
    if (licenseExpiryDate) driver.licenseExpiryDate = licenseExpiryDate;
    if (contactNumber) driver.contactNumber = contactNumber;
    if (safetyScore !== undefined) driver.safetyScore = safetyScore;
    if (status) driver.status = status;
    if (region !== undefined) driver.region = region;

    await driver.save();
    return res.json({ message: 'Driver updated successfully', driver });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(error);
    }
    return res.status(500).json({ error: 'An error occurred while updating the driver.' });
  }
};

// Delete driver (restricted to Admin, FleetManager only - SafetyOfficer cannot delete)
exports.deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    return res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the driver.' });
  }
};
