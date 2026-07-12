const Vehicle = require('../vehicles/vehicle.model');
const Driver = require('../drivers/driver.model');
const Trip = require('../trips/trip.model');

// Get dashboard KPIs with filters
exports.getDashboardKPIs = async (req, res, next) => {
  try {
    const { type, status, region } = req.query;

    // Filters for vehicles
    const vehicleFilter = {};
    if (type) vehicleFilter.type = type;
    if (status) vehicleFilter.status = status;
    if (region) vehicleFilter.region = region;

    // Filters for drivers
    const driverFilter = {};
    if (region) driverFilter.region = region;

    // Filters for trips (can filter by vehicle region if needed, but simple count is standard)
    // To filter trips by vehicle details, we can do that, but basic counts of all active/pending trips is standard.

    const [
      totalVehicles,
      activeVehicles,
      availableVehicles,
      inShopVehicles,
      retiredVehicles,
      totalDrivers,
      activeDrivers,
      activeTrips,
      pendingTrips
    ] = await Promise.all([
      Vehicle.countDocuments(vehicleFilter),
      Vehicle.countDocuments({ ...vehicleFilter, status: 'On Trip' }),
      Vehicle.countDocuments({ ...vehicleFilter, status: 'Available' }),
      Vehicle.countDocuments({ ...vehicleFilter, status: 'In Shop' }),
      Vehicle.countDocuments({ ...vehicleFilter, status: 'Retired' }),
      Driver.countDocuments(driverFilter),
      Driver.countDocuments({ ...driverFilter, status: 'On Trip' }),
      Trip.countDocuments({ status: 'Dispatched' }),
      Trip.countDocuments({ status: 'Draft' })
    ]);

    const nonRetiredVehicles = totalVehicles - retiredVehicles;
    const fleetUtilization = nonRetiredVehicles > 0 
      ? Number(((activeVehicles / nonRetiredVehicles) * 100).toFixed(2)) 
      : 0;

    return res.json({
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance: inShopVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty: activeDrivers,
      fleetUtilization,
      meta: {
        totalVehicles,
        nonRetiredVehicles,
        totalDrivers,
        filters: { type, status, region }
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while loading dashboard KPIs.' });
  }
};

// Calculate and return Vehicle ROI & Fuel Efficiency reports via aggregation
exports.getVehicleROIReport = async (req, res, next) => {
  try {
    const reports = await Vehicle.aggregate([
      // Lookup fuel logs
      {
        $lookup: {
          from: 'fuellogs',
          localField: '_id',
          foreignField: 'vehicleId',
          as: 'fuelLogs'
        }
      },
      // Lookup maintenance logs
      {
        $lookup: {
          from: 'maintenancelogs',
          localField: '_id',
          foreignField: 'vehicleId',
          as: 'maintenanceLogs'
        }
      },
      // Lookup trips
      {
        $lookup: {
          from: 'trips',
          localField: '_id',
          foreignField: 'vehicleId',
          as: 'trips'
        }
      },
      // Initial projection of sums
      {
        $project: {
          registrationNumber: 1,
          name: 1,
          model: 1,
          type: 1,
          acquisitionCost: 1,
          status: 1,
          fuelCost: { $sum: '$fuelLogs.cost' },
          fuelLiters: { $sum: '$fuelLogs.liters' },
          maintenanceCost: { $sum: '$maintenanceLogs.cost' },
          actualDistance: { $sum: '$trips.actualDistance' },
          revenue: { $sum: '$trips.revenue' }
        }
      },
      // Compute ROI and Fuel Efficiency metrics
      {
        $project: {
          registrationNumber: 1,
          name: 1,
          model: 1,
          type: 1,
          status: 1,
          acquisitionCost: 1,
          fuelCost: 1,
          maintenanceCost: 1,
          totalOperationalCost: { $add: ['$fuelCost', '$maintenanceCost'] },
          actualDistance: 1,
          revenue: 1,
          fuelEfficiency: {
            $cond: {
              if: { $gt: ['$fuelLiters', 0] },
              then: { $round: [{ $divide: ['$actualDistance', '$fuelLiters'] }, 2] },
              else: 0
            }
          },
          roi: {
            $cond: {
              if: { $gt: ['$acquisitionCost', 0] },
              then: {
                $round: [
                  {
                    $divide: [
                      { $subtract: ['$revenue', { $add: ['$maintenanceCost', '$fuelCost'] }] },
                      '$acquisitionCost'
                    ]
                  },
                  4
                ]
              },
              else: 0
            }
          }
        }
      }
    ]);

    return res.json({ count: reports.length, reports });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while calculating vehicle ROI reports.' });
  }
};

// Export ROI reports as CSV stream
exports.exportCSVReport = async (req, res, next) => {
  try {
    // Re-run the aggregation to fetch the report rows
    const reports = await Vehicle.aggregate([
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
        $lookup: {
          from: 'trips',
          localField: '_id',
          foreignField: 'vehicleId',
          as: 'trips'
        }
      },
      {
        $project: {
          registrationNumber: 1,
          name: 1,
          model: 1,
          type: 1,
          acquisitionCost: 1,
          status: 1,
          fuelCost: { $sum: '$fuelLogs.cost' },
          fuelLiters: { $sum: '$fuelLogs.liters' },
          maintenanceCost: { $sum: '$maintenanceLogs.cost' },
          actualDistance: { $sum: '$trips.actualDistance' },
          revenue: { $sum: '$trips.revenue' }
        }
      },
      {
        $project: {
          registrationNumber: 1,
          name: 1,
          model: 1,
          type: 1,
          status: 1,
          acquisitionCost: 1,
          fuelCost: 1,
          maintenanceCost: 1,
          totalOperationalCost: { $add: ['$fuelCost', '$maintenanceCost'] },
          actualDistance: 1,
          revenue: 1,
          fuelEfficiency: {
            $cond: {
              if: { $gt: ['$fuelLiters', 0] },
              then: { $round: [{ $divide: ['$actualDistance', '$fuelLiters'] }, 2] },
              else: 0
            }
          },
          roi: {
            $cond: {
              if: { $gt: ['$acquisitionCost', 0] },
              then: {
                $round: [
                  {
                    $divide: [
                      { $subtract: ['$revenue', { $add: ['$maintenanceCost', '$fuelCost'] }] },
                      '$acquisitionCost'
                    ]
                  },
                  4
                ]
              },
              else: 0
            }
          }
        }
      }
    ]);

    // Build CSV Headers
    const headers = [
      'Registration Number',
      'Name',
      'Model',
      'Type',
      'Status',
      'Acquisition Cost',
      'Fuel Cost',
      'Maintenance Cost',
      'Total Operational Cost',
      'Distance (km)',
      'Revenue',
      'Fuel Efficiency (km/l)',
      'ROI'
    ];

    let csvContent = headers.join(',') + '\n';

    // Build CSV Rows
    reports.forEach((row) => {
      const line = [
        `"${row.registrationNumber}"`,
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.model.replace(/"/g, '""')}"`,
        `"${row.type}"`,
        `"${row.status}"`,
        row.acquisitionCost,
        row.fuelCost,
        row.maintenanceCost,
        row.totalOperationalCost,
        row.actualDistance,
        row.revenue,
        row.fuelEfficiency,
        row.roi
      ];
      csvContent += line.join(',') + '\n';
    });

    // Set Response Headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transitops-roi-report.csv"');
    
    return res.send(csvContent);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred during CSV generation.' });
  }
};
