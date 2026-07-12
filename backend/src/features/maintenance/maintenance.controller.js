const MaintenanceLog = require('./maintenanceLog.model');
const businessRules = require('../../services/businessRules');

// Get all maintenance logs
exports.getMaintenanceLogs = async (req, res, next) => {
  try {
    const logs = await MaintenanceLog.find()
      .populate('vehicleId', 'registrationNumber name model status');
    return res.json({ count: logs.length, logs });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while retrieving maintenance logs.' });
  }
};

// Create a maintenance log (and put vehicle In Shop)
exports.createMaintenanceLog = async (req, res, next) => {
  try {
    const { vehicleId, description, cost, startDate } = req.body;

    if (!vehicleId || !description || cost === undefined) {
      return res.status(400).json({ error: 'Missing required maintenance fields: vehicleId, description, cost' });
    }

    const result = await businessRules.startMaintenance({
      vehicleId,
      description,
      cost,
      startDate
    });

    return res.status(201).json({
      message: 'Maintenance record created successfully. Vehicle status changed to In Shop.',
      log: result.log,
      vehicle: result.vehicle
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to start maintenance.' });
  }
};

// Close an active maintenance log (and restore vehicle to Available unless Retired)
exports.closeMaintenanceLog = async (req, res, next) => {
  try {
    const { endDate } = req.body;

    const result = await businessRules.closeMaintenance(req.params.id, endDate);

    return res.json({
      message: 'Maintenance record closed successfully. Vehicle status restored.',
      log: result.log,
      vehicle: result.vehicle
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to close maintenance.' });
  }
};
