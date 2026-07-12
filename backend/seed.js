require('dotenv').config();
const mongoose = require('mongoose');

// Import Models
const User = require('./src/features/auth/user.model');
const Vehicle = require('./src/features/vehicles/vehicle.model');
const Driver = require('./src/features/drivers/driver.model');
const Trip = require('./src/features/trips/trip.model');
const FuelLog = require('./src/features/finance/fuelLog.model');
const MaintenanceLog = require('./src/features/maintenance/maintenanceLog.model');
const Expense = require('./src/features/finance/expense.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/transitops';

async function seedDatabase() {
  console.log('--- STARTING DATABASE SEEDING FOR TRANSITOPS DEMO ---');
  
  try {
    // 1. Connect to Database
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB.');

    // 2. Clear Existing Demo Data
    console.log('Clearing existing data collections to prevent duplicates...');
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await Trip.deleteMany({});
    await FuelLog.deleteMany({});
    await MaintenanceLog.deleteMany({});
    if (Expense) {
      await Expense.deleteMany({});
    }
    console.log('✓ Existing collections cleared.');

    // 3. Seed Users
    console.log('\nSeeding Users per role...');
    
    const usersData = [
      {
        name: 'System Admin',
        email: 'admin@transitops.com',
        passwordHash: 'Demo@123',
        role: 'Admin'
      },
      {
        name: 'Manager Bob',
        email: 'manager@transitops.com',
        passwordHash: 'Demo@123',
        role: 'FleetManager'
      },
      {
        name: 'Driver Dave',
        email: 'driver@transitops.com',
        passwordHash: 'Demo@123',
        role: 'Driver'
      },
      {
        name: 'Officer Sarah',
        email: 'safety@transitops.com',
        passwordHash: 'Demo@123',
        role: 'SafetyOfficer'
      },
      {
        name: 'Analyst Frank',
        email: 'finance@transitops.com',
        passwordHash: 'Demo@123',
        role: 'FinancialAnalyst'
      }
    ];

    const seededUsers = await User.create(usersData);
    const managerUser = seededUsers.find(u => u.role === 'FleetManager');
    console.log(`✓ Seeded ${seededUsers.length} users successfully.`);

    // 4. Seed Vehicles
    console.log('\nSeeding Vehicles (5 total with mixed statuses)...');
    
    const vehiclesData = [
      {
        registrationNumber: 'KA-01-TX-2048',
        name: 'Volvo 9400 Intercity',
        model: 'Volvo 9400',
        type: 'Bus',
        maxLoadCapacity: 15000,
        odometer: 12000,
        acquisitionCost: 95000,
        status: 'Available',
        region: 'North'
      },
      {
        registrationNumber: 'MH-12-FL-7781',
        name: 'Tata Prima 5530',
        model: 'Tata Prima',
        type: 'Truck',
        maxLoadCapacity: 32000,
        odometer: 45000,
        acquisitionCost: 120000,
        status: 'On Trip',
        region: 'West'
      },
      {
        registrationNumber: 'DL-09-UR-1188',
        name: 'Ashok Leyland Lynx',
        model: 'Lynx',
        type: 'Bus',
        maxLoadCapacity: 12000,
        odometer: 67000,
        acquisitionCost: 80000,
        status: 'In Shop',
        region: 'North'
      },
      {
        registrationNumber: 'TN-22-LG-0432',
        name: 'Force Traveller 3350',
        model: 'Traveller',
        type: 'Van',
        maxLoadCapacity: 3000,
        odometer: 120000,
        acquisitionCost: 50000,
        status: 'Retired',
        region: 'South'
      },
      {
        registrationNumber: 'GJ-05-RT-3904',
        name: 'Eicher Pro 3015',
        model: 'Pro 3015',
        type: 'Truck',
        maxLoadCapacity: 16000,
        odometer: 23000,
        acquisitionCost: 75000,
        status: 'Available',
        region: 'East'
      }
    ];

    const seededVehicles = await Vehicle.create(vehiclesData);
    console.log(`✓ Seeded ${seededVehicles.length} vehicles successfully.`);

    // 5. Seed Drivers
    console.log('\nSeeding Drivers (5 total with mixed statuses)...');
    
    // Calculate license expiry dates relative to current date (July 2026)
    const validExpiry = new Date('2028-12-31');
    const expiredExpiry = new Date('2025-01-01'); // expired in 2025

    const driversData = [
      {
        name: 'Anika Rao',
        licenseNumber: 'DL-112233A',
        licenseCategory: 'Heavy',
        licenseExpiryDate: validExpiry,
        contactNumber: '+919876543210',
        safetyScore: 92,
        status: 'Available',
        region: 'North'
      },
      {
        name: 'Dev Mehta',
        licenseNumber: 'DL-445566B',
        licenseCategory: 'Heavy',
        licenseExpiryDate: validExpiry,
        contactNumber: '+919876543211',
        safetyScore: 88,
        status: 'On Trip',
        region: 'West'
      },
      {
        name: 'Maya Singh',
        licenseNumber: 'DL-778899C',
        licenseCategory: 'Light',
        licenseExpiryDate: expiredExpiry, // Expired License
        contactNumber: '+919876543212',
        safetyScore: 95,
        status: 'Available',
        region: 'North'
      },
      {
        name: 'Rohan Iyer',
        licenseNumber: 'DL-121212D',
        licenseCategory: 'Heavy',
        licenseExpiryDate: validExpiry,
        contactNumber: '+919876543213',
        safetyScore: 65,
        status: 'Suspended', // Suspended Status
        region: 'South'
      },
      {
        name: 'Kabir Shah',
        licenseNumber: 'DL-343434E',
        licenseCategory: 'Heavy',
        licenseExpiryDate: validExpiry,
        contactNumber: '+919876543214',
        safetyScore: 90,
        status: 'Available',
        region: 'East'
      }
    ];

    const seededDrivers = await Driver.create(driversData);
    console.log(`✓ Seeded ${seededDrivers.length} drivers successfully.`);

    // Match vehicles and drivers for trip seeding
    const volvoBus = seededVehicles.find(v => v.registrationNumber === 'KA-01-TX-2048');
    const tataTruck = seededVehicles.find(v => v.registrationNumber === 'MH-12-FL-7781');
    const eicherTruck = seededVehicles.find(v => v.registrationNumber === 'GJ-05-RT-3904');
    const leylandBus = seededVehicles.find(v => v.registrationNumber === 'DL-09-UR-1188');

    const driverAnika = seededDrivers.find(d => d.licenseNumber === 'DL-112233A');
    const driverDev = seededDrivers.find(d => d.licenseNumber === 'DL-445566B');
    const driverKabir = seededDrivers.find(d => d.licenseNumber === 'DL-343434E');

    // 6. Seed Trips
    console.log('\nSeeding Trips...');
    
    const tripsData = [
      // 3 Completed Trips with realistic numbers
      {
        source: 'Mumbai Depot A',
        destination: 'Pune Hub',
        vehicleId: volvoBus._id,
        driverId: driverAnika._id,
        cargoWeight: 8000,
        plannedDistance: 150,
        actualDistance: 150,
        fuelConsumed: 30,
        revenue: 1200,
        status: 'Completed',
        createdBy: managerUser._id
      },
      {
        source: 'Delhi Warehouse West',
        destination: 'Jaipur Terminal',
        vehicleId: eicherTruck._id,
        driverId: driverKabir._id,
        cargoWeight: 12000,
        plannedDistance: 270,
        actualDistance: 275,
        fuelConsumed: 55,
        revenue: 2500,
        status: 'Completed',
        createdBy: managerUser._id
      },
      {
        source: 'Ahmedabad Industrial GIDC',
        destination: 'Surat Cargo Center',
        vehicleId: tataTruck._id,
        driverId: driverDev._id,
        cargoWeight: 20000,
        plannedDistance: 260,
        actualDistance: 260,
        fuelConsumed: 70,
        revenue: 3000,
        status: 'Completed',
        createdBy: managerUser._id
      },
      // 1 Dispatched Trip to justify vehicle 'On Trip' and driver 'On Trip'
      {
        source: 'Ahmedabad Industrial GIDC',
        destination: 'Mumbai Port Depot',
        vehicleId: tataTruck._id,
        driverId: driverDev._id,
        cargoWeight: 18000,
        plannedDistance: 530,
        status: 'Dispatched',
        createdBy: managerUser._id
      }
    ];

    const seededTrips = await Trip.create(tripsData);
    console.log(`✓ Seeded ${seededTrips.length} trips (3 Completed, 1 Dispatched) successfully.`);

    // 7. Seed Fuel Logs for Completed Trips
    console.log('\nSeeding Fuel Logs for completed trips...');
    const completedTrips = seededTrips.filter(t => t.status === 'Completed');
    
    const fuelLogsData = [];
    for (const trip of completedTrips) {
      fuelLogsData.push({
        vehicleId: trip.vehicleId,
        tripId: trip._id,
        liters: trip.fuelConsumed,
        cost: trip.fuelConsumed * 2.0, // Assuming a rate of $2.0 per liter
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      });
    }
    
    // Add an extra manual fuel purchase log for additional flavor
    fuelLogsData.push({
      vehicleId: volvoBus._id,
      tripId: null,
      liters: 100,
      cost: 200.0,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });

    const seededFuelLogs = await FuelLog.create(fuelLogsData);
    console.log(`✓ Seeded ${seededFuelLogs.length} fuel logs successfully.`);

    // 8. Seed Maintenance Log for the "In Shop" Vehicle
    console.log('\nSeeding Maintenance Logs...');
    const maintenanceLogsData = [
      {
        vehicleId: leylandBus._id,
        description: 'Brake Pad Replacement & Suspension Overhaul',
        cost: 1200,
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Started 1 day ago
      }
    ];

    const seededMaintenance = await MaintenanceLog.create(maintenanceLogsData);
    console.log(`✓ Seeded ${seededMaintenance.length} active maintenance logs successfully.`);

    console.log('\n=========================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=========================================');

  } catch (error) {
    console.error('❌ SEEDING ERROR:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedDatabase();
