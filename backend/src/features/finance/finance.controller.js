const FuelLog = require('./fuelLog.model');
const Expense = require('./expense.model');
const Vehicle = require('../vehicles/vehicle.model');

// Log a fuel purchase
exports.logFuel = async (req, res, next) => {
  try {
    const { vehicleId, tripId, liters, cost, date } = req.body;

    if (!vehicleId || liters === undefined || cost === undefined) {
      return res.status(400).json({ error: 'Missing required fuel log fields: vehicleId, liters, cost' });
    }

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const fuelLog = new FuelLog({
      vehicleId,
      tripId: tripId || null,
      liters,
      cost,
      date: date || new Date()
    });

    await fuelLog.save();
    return res.status(201).json({ message: 'Fuel purchase logged successfully', fuelLog });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(error);
    }
    return res.status(500).json({ error: 'An error occurred while logging fuel.' });
  }
};

// Log an expense (Toll or Other)
exports.logExpense = async (req, res, next) => {
  try {
    const { vehicleId, type, amount, date, description } = req.body;

    if (!vehicleId || !type || amount === undefined) {
      return res.status(400).json({ error: 'Missing required expense fields: vehicleId, type, amount' });
    }

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const expense = new Expense({
      vehicleId,
      type,
      amount,
      date: date || new Date(),
      description
    });

    await expense.save();
    return res.status(201).json({ message: 'Expense logged successfully', expense });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(error);
    }
    return res.status(500).json({ error: 'An error occurred while logging the expense.' });
  }
};

// Get operational costs (Fuel + Maintenance) grouped by vehicle using aggregation
exports.getOperationalCosts = async (req, res, next) => {
  try {
    const report = await Vehicle.aggregate([
      {
        $lookup: {
          from: 'fuellogs',
          localField: '_id',
          foreignField: 'vehicleId',
          as: 'fuelLogs'
        }
      },
      {
        $lookup: {
          from: 'maintenancelogs',
          localField: '_id',
          foreignField: 'vehicleId',
          as: 'maintenanceLogs'
        }
      },
      {
        $project: {
          registrationNumber: 1,
          name: 1,
          model: 1,
          type: 1,
          status: 1,
          fuelCost: { $sum: '$fuelLogs.cost' },
          maintenanceCost: { $sum: '$maintenanceLogs.cost' },
          totalOperationalCost: {
            $add: [
              { $sum: '$fuelLogs.cost' },
              { $sum: '$maintenanceLogs.cost' }
            ]
          }
        }
      }
    ]);

    return res.json({ count: report.length, operationalCosts: report });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while aggregating operational costs.' });
  }
};

// Get all fuel logs
exports.getFuelLogs = async (req, res, next) => {
  try {
    const fuelLogs = await FuelLog.find().populate('vehicleId', 'registrationNumber model');
    return res.json(fuelLogs);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while retrieving fuel logs.' });
  }
};

// Get all expenses
exports.getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find().populate('vehicleId', 'registrationNumber model');
    return res.json(expenses);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while retrieving expenses.' });
  }
};
