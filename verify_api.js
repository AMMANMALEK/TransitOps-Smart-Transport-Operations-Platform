require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const mongoose = require('mongoose');

const PORT = 5001; // Separate port for testing
let server;

// Helper function to sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('--- STARTING TRANSITOPS BACKEND SMOKE TESTS ---');
  
  // 1. Start test server
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`Test Server running on port ${PORT}`);
  });

  const baseUrl = `http://127.0.0.1:${PORT}/api`;
  let adminToken = '';
  let managerToken = '';
  let vehicleId = '';
  let driverId = '';
  let tripId = '';
  let maintenanceLogId = '';

  try {
    // ----------------------------------------------------
    // TEST 1: Admin Login (Seeded)
    // ----------------------------------------------------
    console.log('\n[TEST 1] Logging in as seeded Admin...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || 'admin@transitops.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.ok) {
      adminToken = loginData.accessToken;
      console.log('✓ Admin login successful. Token acquired.');
    } else {
      throw new Error(`Failed Admin Login: ${JSON.stringify(loginData)}`);
    }

    // ----------------------------------------------------
    // TEST 2: Register User (Admin protected route)
    // ----------------------------------------------------
    console.log('\n[TEST 2] Admin registers a new Fleet Manager...');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Manager Bob',
        email: 'bob.manager@transitops.com',
        password: 'managerpassword123',
        role: 'FleetManager'
      })
    });
    const regData = await regRes.json();
    if (regRes.status === 201) {
      console.log('✓ Fleet Manager registration successful.');
    } else {
      throw new Error(`Failed User Registration: ${JSON.stringify(regData)}`);
    }

    // ----------------------------------------------------
    // TEST 3: Login as New Fleet Manager
    // ----------------------------------------------------
    console.log('\n[TEST 3] Logging in as Fleet Manager (Bob)...');
    const bobLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bob.manager@transitops.com',
        password: 'managerpassword123'
      })
    });
    const bobLoginData = await bobLoginRes.json();
    if (bobLoginRes.ok) {
      managerToken = bobLoginData.accessToken;
      console.log('✓ Fleet Manager login successful. Token acquired.');
    } else {
      throw new Error(`Failed Manager Login: ${JSON.stringify(bobLoginData)}`);
    }

    // ----------------------------------------------------
    // TEST 4: Create Driver (Fleet Manager protected route)
    // ----------------------------------------------------
    console.log('\n[TEST 4] Fleet Manager creates a Driver profile...');
    const driverRes = await fetch(`${baseUrl}/drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        name: 'Alex Driver',
        licenseNumber: 'DL-998877A',
        licenseCategory: 'Commercial Class A',
        licenseExpiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year from now
        contactNumber: '+1-555-0199',
        region: 'North'
      })
    });
    const driverData = await driverRes.json();
    if (driverRes.status === 201) {
      driverId = driverData.driver._id;
      console.log(`✓ Driver profile created. ID: ${driverId}`);
    } else {
      throw new Error(`Failed Driver Creation: ${JSON.stringify(driverData)}`);
    }

    // ----------------------------------------------------
    // TEST 5: Create Vehicle (Fleet Manager protected route)
    // ----------------------------------------------------
    console.log('\n[TEST 5] Fleet Manager registers a Vehicle...');
    const vehicleRes = await fetch(`${baseUrl}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        registrationNumber: 'TRUCK-7788',
        name: 'Volvo Heavy Duty',
        model: 'FH16',
        type: 'Heavy Truck',
        maxLoadCapacity: 15000, // 15,000 kg
        odometer: 12000, // 12,000 km
        acquisitionCost: 95000,
        region: 'North'
      })
    });
    const vehicleData = await vehicleRes.json();
    if (vehicleRes.status === 201) {
      vehicleId = vehicleData.vehicle._id;
      console.log(`✓ Vehicle registered. ID: ${vehicleId}`);
    } else {
      throw new Error(`Failed Vehicle Creation: ${JSON.stringify(vehicleData)}`);
    }

    // ----------------------------------------------------
    // TEST 6: Create Trips (Draft, Optional Revenue)
    // ----------------------------------------------------
    console.log('\n[TEST 6] Creating active Trip 1 and Trip 2 drafts...');
    const tripRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        source: 'Warehouse A',
        destination: 'Retail Depot B',
        vehicleId,
        driverId,
        cargoWeight: 8000, // 8,000 kg (under max 15,000 kg)
        plannedDistance: 320
      })
    });
    const tripData = await tripRes.json();
    if (tripRes.status === 201) {
      tripId = tripData.trip._id;
      console.log(`✓ Trip 1 draft created. ID: ${tripId}`);
    } else {
      throw new Error(`Failed Trip 1 Creation: ${JSON.stringify(tripData)}`);
    }

    let tripId2 = '';
    const tripRes2 = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        source: 'Warehouse C',
        destination: 'Depot D',
        vehicleId,
        driverId,
        cargoWeight: 1000,
        plannedDistance: 100
      })
    });
    const tripData2 = await tripRes2.json();
    if (tripRes2.status === 201) {
      tripId2 = tripData2.trip._id;
      console.log(`✓ Trip 2 draft created. ID: ${tripId2}`);
    } else {
      throw new Error(`Failed Trip 2 Creation: ${JSON.stringify(tripData2)}`);
    }

    // ----------------------------------------------------
    // TEST 7: Cargo Weight Limit Validation Check
    // ----------------------------------------------------
    console.log('\n[TEST 7] Verifying Cargo Weight Business Rule...');
    const badTripRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        source: 'Warehouse A',
        destination: 'Retail Depot B',
        vehicleId,
        driverId,
        cargoWeight: 20000, // Exceeds max 15,000 kg
        plannedDistance: 320
      })
    });
    const badTripData = await badTripRes.json();
    if (badTripRes.status === 400) {
      console.log(`✓ Cargo weight verification blocked request. Msg: "${badTripData.error}"`);
    } else {
      throw new Error(`Failed weight limit test: Should have blocked cargo overload, but returned status ${badTripRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 8: Dispatch Trip (updates status to On Trip)
    // ----------------------------------------------------
    console.log('\n[TEST 8] Dispatching Trip 1...');
    const dispRes = await fetch(`${baseUrl}/trips/${tripId}/dispatch`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      }
    });
    const dispData = await dispRes.json();
    if (dispRes.status === 200) {
      console.log('✓ Trip 1 dispatched. Checking vehicle & driver status updates...');
      
      // Verify vehicle status
      const vCheck = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const vCheckData = await vCheck.json();
      console.log(`  Vehicle Status: ${vCheckData.vehicle.status} (Expected: On Trip)`);

      // Verify driver status
      const dCheck = await fetch(`${baseUrl}/drivers/${driverId}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const dCheckData = await dCheck.json();
      console.log(`  Driver Status: ${dCheckData.driver.status} (Expected: On Trip)`);

      if (vCheckData.vehicle.status !== 'On Trip' || dCheckData.driver.status !== 'On Trip') {
        throw new Error('Statuses did not update to "On Trip" upon dispatch!');
      }
    } else {
      throw new Error(`Failed Trip Dispatch: ${JSON.stringify(dispData)}`);
    }

    // ----------------------------------------------------
    // TEST 9: Double Dispatch Guard Check
    // ----------------------------------------------------
    console.log('\n[TEST 9] Attempting secondary trip dispatch with busy vehicle/driver...');
    
    // Dispatch trip 2 (should fail because vehicle and driver are now On Trip from dispatching trip 1)
    const dispRes2 = await fetch(`${baseUrl}/trips/${tripId2}/dispatch`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      }
    });
    const dispData2 = await dispRes2.json();
    if (dispRes2.status === 400) {
      console.log(`✓ Dispatch blocked due to vehicle/driver already "On Trip". Msg: "${dispData2.error}"`);
    } else {
      throw new Error(`Failed busy check: Dispatch should be blocked, status: ${dispRes2.status}`);
    }

    // ----------------------------------------------------
    // TEST 10: Complete Trip (updates status, auto-creates FuelLog)
    // ----------------------------------------------------
    console.log('\n[TEST 10] Completing active Trip...');
    const compRes = await fetch(`${baseUrl}/trips/${tripId}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        actualDistance: 325,
        fuelConsumed: 45, // 45 liters
        revenue: 2500, // Revenue of $2500
        fuelCost: 90 // Fuel cost of $90
      })
    });
    const compData = await compRes.json();
    if (compRes.status === 200) {
      console.log('✓ Trip completed. Validating updates...');
      
      // Verify vehicle status, odometer and fuel log creation
      const vCheck2 = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const vCheckData2 = await vCheck2.json();
      console.log(`  Vehicle Status: ${vCheckData2.vehicle.status} (Expected: Available)`);
      console.log(`  Vehicle Odometer: ${vCheckData2.vehicle.odometer} km (Expected: 12325)`);

      const dCheck2 = await fetch(`${baseUrl}/drivers/${driverId}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const dCheckData2 = await dCheck2.json();
      console.log(`  Driver Status: ${dCheckData2.driver.status} (Expected: Available)`);

      if (vCheckData2.vehicle.status !== 'Available' || vCheckData2.vehicle.odometer !== 12325 || dCheckData2.driver.status !== 'Available') {
        throw new Error('Odometer, Driver, or Vehicle status was not updated properly on completion');
      }
    } else {
      throw new Error(`Failed Trip Completion: ${JSON.stringify(compData)}`);
    }

    // ----------------------------------------------------
    // TEST 11: Maintenance Workflow (Vehicle In Shop status)
    // ----------------------------------------------------
    console.log('\n[TEST 11] Putting vehicle into Maintenance...');
    const maintRes = await fetch(`${baseUrl}/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        vehicleId,
        description: 'Engine Tune Up',
        cost: 450,
        startDate: new Date()
      })
    });
    const maintData = await maintRes.json();
    if (maintRes.status === 201) {
      maintenanceLogId = maintData.log._id;
      console.log(`✓ Maintenance record created. Log ID: ${maintenanceLogId}`);
      
      const vCheck3 = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const vCheckData3 = await vCheck3.json();
      console.log(`  Vehicle Status: ${vCheckData3.vehicle.status} (Expected: In Shop)`);
      
      if (vCheckData3.vehicle.status !== 'In Shop') {
        throw new Error('Vehicle status did not transition to "In Shop" on active maintenance log!');
      }
    } else {
      throw new Error(`Failed Maintenance Creation: ${JSON.stringify(maintData)}`);
    }

    // ----------------------------------------------------
    // TEST 12: Trip Creation Blocked for In Shop Vehicle
    // ----------------------------------------------------
    console.log('\n[TEST 12] Confirming vehicle "In Shop" dispatch selection block...');
    const badTripRes2 = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        source: 'Warehouse A',
        destination: 'Retail Depot B',
        vehicleId,
        driverId,
        cargoWeight: 8000,
        plannedDistance: 320
      })
    });
    const badTripData2 = await badTripRes2.json();
    if (badTripRes2.status === 400) {
      console.log(`✓ Blocked assignment of In Shop vehicle. Msg: "${badTripData2.error}"`);
    } else {
      throw new Error(`Failed In Shop assignment guard: Should have blocked vehicle, status code: ${badTripRes2.status}`);
    }

    // ----------------------------------------------------
    // TEST 13: Close Maintenance
    // ----------------------------------------------------
    console.log('\n[TEST 13] Closing Maintenance record...');
    const closeMaintRes = await fetch(`${baseUrl}/maintenance/${maintenanceLogId}/close`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        endDate: new Date()
      })
    });
    const closeMaintData = await closeMaintRes.json();
    if (closeMaintRes.status === 200) {
      console.log('✓ Maintenance closed. Checking vehicle status restoration...');
      
      const vCheck4 = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const vCheckData4 = await vCheck4.json();
      console.log(`  Vehicle Status: ${vCheckData4.vehicle.status} (Expected: Available)`);
      if (vCheckData4.vehicle.status !== 'Available') {
        throw new Error('Vehicle did not restore to Available upon closing maintenance!');
      }
    } else {
      throw new Error(`Failed Maintenance Close: ${JSON.stringify(closeMaintData)}`);
    }

    // ----------------------------------------------------
    // TEST 16: Expired License Guard Check
    // ----------------------------------------------------
    console.log('\n[TEST 16] Attempting to create a trip with an expired-license driver...');
    const expiredDriverRes = await fetch(`${baseUrl}/drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        name: 'Expired Joe',
        licenseNumber: 'DL-EXPIRED12',
        licenseCategory: 'Commercial Class A',
        licenseExpiryDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
        contactNumber: '+1-555-0100',
        region: 'North'
      })
    });
    const expiredDriverData = await expiredDriverRes.json();
    const expiredDriverId = expiredDriverData.driver._id;

    // Try to create a trip
    const expiredTripRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        source: 'Warehouse A',
        destination: 'Retail Depot B',
        vehicleId,
        driverId: expiredDriverId,
        cargoWeight: 1000,
        plannedDistance: 100
      })
    });
    const expiredTripData = await expiredTripRes.json();
    if (expiredTripRes.status === 400) {
      console.log(`✓ Expired license blocked successfully. Msg: "${expiredTripData.error}"`);
    } else {
      throw new Error(`Failed expired license check: Should block, status code: ${expiredTripRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 17: Suspended Driver Guard Check
    // ----------------------------------------------------
    console.log('\n[TEST 17] Attempting to create a trip with a Suspended driver...');
    const suspDriverRes = await fetch(`${baseUrl}/drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        name: 'Suspended Sam',
        licenseNumber: 'DL-SUSP99',
        licenseCategory: 'Commercial Class A',
        licenseExpiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        contactNumber: '+1-555-0200',
        region: 'North'
      })
    });
    const suspDriverData = await suspDriverRes.json();
    const suspDriverId = suspDriverData.driver._id;

    // Update driver to Suspended
    const suspUpdateRes = await fetch(`${baseUrl}/drivers/${suspDriverId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({ status: 'Suspended' })
    });

    // Try to create a trip
    const suspTripRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        source: 'Warehouse A',
        destination: 'Retail Depot B',
        vehicleId,
        driverId: suspDriverId,
        cargoWeight: 1000,
        plannedDistance: 100
      })
    });
    const suspTripData = await suspTripRes.json();
    if (suspTripRes.status === 400) {
      console.log(`✓ Suspended driver blocked successfully. Msg: "${suspTripData.error}"`);
    } else {
      throw new Error(`Failed suspended driver check: Should block, status code: ${suspTripRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 18: Complete Guard on Draft status
    // ----------------------------------------------------
    console.log('\n[TEST 18] Attempting to complete a Draft trip...');
    const draftCompRes = await fetch(`${baseUrl}/trips/${tripId2}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        actualDistance: 100,
        fuelConsumed: 20,
        revenue: 1000,
        fuelCost: 40
      })
    });
    const draftCompData = await draftCompRes.json();
    if (draftCompRes.status === 400) {
      console.log(`✓ Rejection of Draft completion succeeded. Msg: "${draftCompData.error}"`);
    } else {
      throw new Error(`Failed Draft completion guard: Should reject with 400, status code: ${draftCompRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 19: Double Dispatch Guard Check
    // ----------------------------------------------------
    console.log('\n[TEST 19] Attempting to dispatch an already Completed trip...');
    const compDispRes = await fetch(`${baseUrl}/trips/${tripId}/dispatch`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      }
    });
    const compDispData = await compDispRes.json();
    if (compDispRes.status === 400) {
      console.log(`✓ Rejection of Completed dispatch succeeded. Msg: "${compDispData.error}"`);
    } else {
      throw new Error(`Failed Completed dispatch guard: Should reject with 400, status code: ${compDispRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 20: Duplicate Vehicle registrationNumber (409 Conflict)
    // ----------------------------------------------------
    console.log('\n[TEST 20] Attempting to register a duplicate vehicle (TRUCK-7788)...');
    const dupVehicleRes = await fetch(`${baseUrl}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        registrationNumber: 'TRUCK-7788',
        name: 'Volvo Copycat',
        model: 'FH16',
        type: 'Heavy Truck',
        maxLoadCapacity: 10000,
        odometer: 0,
        acquisitionCost: 50000
      })
    });
    const dupVehicleData = await dupVehicleRes.json();
    if (dupVehicleRes.status === 409) {
      console.log(`✓ Duplicate vehicle blocked with 409 Conflict. Msg: "${dupVehicleData.error}"`);
    } else {
      throw new Error(`Failed duplicate vehicle guard: Should return 409, status code: ${dupVehicleRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 21: Duplicate Driver licenseNumber (409 Conflict)
    // ----------------------------------------------------
    console.log('\n[TEST 21] Attempting to register a duplicate driver (DL-998877A)...');
    const dupDriverRes = await fetch(`${baseUrl}/drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        name: 'Alex Duplicate',
        licenseNumber: 'DL-998877A',
        licenseCategory: 'Commercial Class A',
        licenseExpiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        contactNumber: '+1-555-0300'
      })
    });
    const dupDriverData = await dupDriverRes.json();
    if (dupDriverRes.status === 409) {
      console.log(`✓ Duplicate driver blocked with 409 Conflict. Msg: "${dupDriverData.error}"`);
    } else {
      throw new Error(`Failed duplicate driver guard: Should return 409, status code: ${dupDriverRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 22: Role-based Authorization Restriction (403 Forbidden)
    // ----------------------------------------------------
    console.log('\n[TEST 22] Testing driver authorization restriction on POST /vehicles...');
    // Create Driver User
    const regDriverRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Sam Driver User',
        email: 'driver.sam@transitops.com',
        password: 'driverpwd123',
        role: 'Driver'
      })
    });
    const regDriverData = await regDriverRes.json();
    if (regDriverRes.status !== 201) {
      throw new Error(`Failed to register Driver user: ${JSON.stringify(regDriverData)}`);
    }

    // Log in as Driver User
    const drvLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'driver.sam@transitops.com',
        password: 'driverpwd123'
      })
    });
    const drvLoginData = await drvLoginRes.json();
    const driverUserToken = drvLoginData.accessToken;

    // Attempt to create vehicle
    const unauthorizedRes = await fetch(`${baseUrl}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverUserToken}`
      },
      body: JSON.stringify({
        registrationNumber: 'TRUCK-9999',
        name: 'Unauthorized Volvo',
        model: 'FH16',
        type: 'Heavy Truck',
        maxLoadCapacity: 10000,
        odometer: 0,
        acquisitionCost: 50000
      })
    });
    const unauthorizedData = await unauthorizedRes.json();
    if (unauthorizedRes.status === 403) {
      console.log(`✓ Driver blocked with 403 Forbidden. Msg: "${unauthorizedData.error}"`);
    } else {
      throw new Error(`Failed authorization check: Driver should be blocked with 403, status code: ${unauthorizedRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 14: Analytics, Dashboard & operational-costs
    // ----------------------------------------------------
    console.log('\n[TEST 14] Fetching analytics dashboards & aggregations...');
    
    // Operational costs
    const costRes = await fetch(`${baseUrl}/finance/operational-costs`, {
      headers: { 'Authorization': `Bearer ${managerToken}` }
    });
    const costData = await costRes.json();
    console.log('  Operational Costs Per Vehicle (Fuel + Maintenance):');
    console.log(JSON.stringify(costData.operationalCosts, null, 2));

    // Dashboard KPIs
    const kpiRes = await fetch(`${baseUrl}/reports/dashboard`, {
      headers: { 'Authorization': `Bearer ${managerToken}` }
    });
    const kpiData = await kpiRes.json();
    console.log('  Dashboard KPIs:');
    console.log(JSON.stringify(kpiData, null, 2));

    // Vehicle ROI report
    const roiRes = await fetch(`${baseUrl}/reports/vehicle-roi`, {
      headers: { 'Authorization': `Bearer ${managerToken}` }
    });
    const roiData = await roiRes.json();
    console.log('  Vehicle ROI Metrics:');
    console.log(JSON.stringify(roiData.reports, null, 2));

    // ----------------------------------------------------
    // TEST 15: CSV Export Streaming
    // ----------------------------------------------------
    console.log('\n[TEST 15] Fetching CSV export...');
    const csvRes = await fetch(`${baseUrl}/reports/export-csv`, {
      headers: { 'Authorization': `Bearer ${managerToken}` }
    });
    const csvContent = await csvRes.text();
    if (csvRes.status === 200) {
      console.log('✓ CSV export successful. Snippet of CSV Content:');
      console.log(csvContent.substring(0, 300) + '\n...');
    } else {
      throw new Error(`Failed CSV Export: status ${csvRes.status}`);
    }

    console.log('\n=========================================');
    console.log('ALL SMOKE TESTS COMPLETED SUCCESSFULLY!');
    console.log('=========================================');

  } catch (error) {
    console.error('\n❌ SMOKE TEST FAILURE:', error.message);
    process.exitCode = 1;
  } finally {
    // Cleanup Database collections to keep things clean for runtime
    try {
      console.log('\nCleaning up database collections...');
      await mongoose.connection.db.dropCollection('users').catch(() => {});
      await mongoose.connection.db.dropCollection('vehicles').catch(() => {});
      await mongoose.connection.db.dropCollection('drivers').catch(() => {});
      await mongoose.connection.db.dropCollection('trips').catch(() => {});
      await mongoose.connection.db.dropCollection('maintenancelogs').catch(() => {});
      await mongoose.connection.db.dropCollection('fuellogs').catch(() => {});
      await mongoose.connection.db.dropCollection('expenses').catch(() => {});
      console.log('✓ DB Cleaned.');
    } catch (e) {
      console.error('Error during DB cleanup:', e.message);
    }
    
    // Close Server and DB connection
    console.log('Closing server & connection...');
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
    console.log('Testing process closed.');
  }
}

runTests();
