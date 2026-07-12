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

  // Clear any existing collections to ensure a clean slate for smoke tests
  console.log('Clearing database collections for smoke tests...');
  await mongoose.connection.db.dropCollection('users').catch(() => {});
  await mongoose.connection.db.dropCollection('vehicles').catch(() => {});
  await mongoose.connection.db.dropCollection('drivers').catch(() => {});
  await mongoose.connection.db.dropCollection('trips').catch(() => {});
  await mongoose.connection.db.dropCollection('maintenancelogs').catch(() => {});
  await mongoose.connection.db.dropCollection('fuellogs').catch(() => {});
  await mongoose.connection.db.dropCollection('expenses').catch(() => {});

  // Seed initial Admin user using env credentials
  const User = require('./src/features/auth/user.model');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@transitops.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminUser = new User({
    name: 'System Admin',
    email: adminEmail.toLowerCase(),
    passwordHash: adminPassword,
    role: 'Admin'
  });
  await adminUser.save();
  console.log(`✓ Admin user seeded successfully for smoke tests.`);

  server = app.listen(PORT, () => {
    console.log(`Test Server running on port ${PORT}`);
  });

  const baseUrl = `http://127.0.0.1:${PORT}/api`;
  let adminToken = '';
  let adminRefreshToken = '';
  let managerToken = '';
  let managerRefreshToken = '';
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
      adminRefreshToken = loginData.refreshToken;
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
      managerRefreshToken = bobLoginData.refreshToken;
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

    // ============================================================
    // EXTENDED TESTS — Trip + Maintenance deep-validation suite
    // ============================================================

    // We'll track pass/fail for each extended test
    const extResults = [];
    const extPass = (name) => { extResults.push({ name, passed: true }); console.log(`✓ PASS: ${name}`); };
    const extFail = (name, reason) => { extResults.push({ name, passed: false, reason }); console.log(`✗ FAIL: ${name} — ${reason}`); };

    // ----------------------------------------------------
    // EXT-1: Full trip lifecycle — create, dispatch, confirm On Trip lock
    // ----------------------------------------------------
    console.log('\n[EXT-1] Create trip, dispatch it, confirm vehicle+driver lock to "On Trip"...');
    try {
      // Create a fresh trip with the available vehicle & driver
      const ext1CreateRes = await fetch(`${baseUrl}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
        body: JSON.stringify({
          source: 'Depot Alpha',
          destination: 'Hub Omega',
          vehicleId,
          driverId,
          cargoWeight: 5000,
          plannedDistance: 200
        })
      });
      const ext1CreateData = await ext1CreateRes.json();
      if (ext1CreateRes.status !== 201) throw new Error(`Trip creation failed: ${JSON.stringify(ext1CreateData)}`);
      const ext1TripId = ext1CreateData.trip._id;

      // Dispatch it
      const ext1DispRes = await fetch(`${baseUrl}/trips/${ext1TripId}/dispatch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` }
      });
      if (ext1DispRes.status !== 200) throw new Error(`Dispatch failed: status ${ext1DispRes.status}`);

      // Confirm vehicle is On Trip
      const ext1VehRes = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const ext1VehData = await ext1VehRes.json();

      // Confirm driver is On Trip
      const ext1DrvRes = await fetch(`${baseUrl}/drivers/${driverId}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const ext1DrvData = await ext1DrvRes.json();

      if (ext1VehData.vehicle.status === 'On Trip' && ext1DrvData.driver.status === 'On Trip') {
        extPass('EXT-1: Dispatch locks vehicle+driver to On Trip');
      } else {
        extFail('EXT-1: Dispatch locks vehicle+driver to On Trip',
          `Vehicle=${ext1VehData.vehicle.status}, Driver=${ext1DrvData.driver.status}`);
      }

      // ----------------------------------------------------
      // EXT-2: Second trip on same vehicle — confirm rejection
      // ----------------------------------------------------
      console.log('\n[EXT-2] Attempt second trip on same (On Trip) vehicle...');
      const ext2Res = await fetch(`${baseUrl}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
        body: JSON.stringify({
          source: 'Depot Beta',
          destination: 'Hub Gamma',
          vehicleId,
          driverId,
          cargoWeight: 3000,
          plannedDistance: 150
        })
      });
      const ext2Data = await ext2Res.json();
      if (ext2Res.status === 400) {
        extPass('EXT-2: Second trip on busy vehicle rejected');
        console.log(`  Rejection message: "${ext2Data.error}"`);
      } else {
        extFail('EXT-2: Second trip on busy vehicle rejected',
          `Expected 400, got ${ext2Res.status}`);
      }

      // ----------------------------------------------------
      // EXT-3: Complete trip — confirm FuelLog + odometer update
      // ----------------------------------------------------
      console.log('\n[EXT-3] Complete trip, verify FuelLog auto-creation + odometer...');

      // Capture odometer BEFORE completion
      const ext3PreVehRes = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const ext3PreVehData = await ext3PreVehRes.json();
      const odometerBefore = ext3PreVehData.vehicle.odometer;

      const ext3CompRes = await fetch(`${baseUrl}/trips/${ext1TripId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
        body: JSON.stringify({
          actualDistance: 210,
          fuelConsumed: 38,
          revenue: 1800,
          fuelCost: 76
        })
      });
      const ext3CompData = await ext3CompRes.json();

      if (ext3CompRes.status !== 200) {
        extFail('EXT-3: Complete trip + FuelLog + odometer', `Completion failed: status ${ext3CompRes.status}`);
      } else {
        // Verify the returned fuelLog exists
        const hasFuelLog = ext3CompData.fuelLog && ext3CompData.fuelLog.liters === 38 && ext3CompData.fuelLog.cost === 76;

        // Verify odometer incremented
        const ext3PostVehRes = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
          headers: { 'Authorization': `Bearer ${managerToken}` }
        });
        const ext3PostVehData = await ext3PostVehRes.json();
        const odometerAfter = ext3PostVehData.vehicle.odometer;
        const odometerCorrect = odometerAfter === odometerBefore + 210;

        // Verify vehicle+driver restored to Available
        const ext3PostDrvRes = await fetch(`${baseUrl}/drivers/${driverId}`, {
          headers: { 'Authorization': `Bearer ${managerToken}` }
        });
        const ext3PostDrvData = await ext3PostDrvRes.json();
        const statusesRestored = ext3PostVehData.vehicle.status === 'Available' && ext3PostDrvData.driver.status === 'Available';

        if (hasFuelLog && odometerCorrect && statusesRestored) {
          extPass('EXT-3: Complete trip + FuelLog + odometer');
          console.log(`  FuelLog: ${ext3CompData.fuelLog.liters}L, $${ext3CompData.fuelLog.cost}`);
          console.log(`  Odometer: ${odometerBefore} → ${odometerAfter} (+210)`);
        } else {
          extFail('EXT-3: Complete trip + FuelLog + odometer',
            `FuelLog=${hasFuelLog}, Odometer=${odometerBefore}→${odometerAfter} (correct=${odometerCorrect}), Statuses=${statusesRestored}`);
        }
      }

      // ----------------------------------------------------
      // EXT-4: Maintenance — confirm In Shop lock + dispatch blocked
      // ----------------------------------------------------
      console.log('\n[EXT-4] Create maintenance, confirm In Shop, confirm dispatch blocked...');
      const ext4MaintRes = await fetch(`${baseUrl}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
        body: JSON.stringify({
          vehicleId,
          description: 'Brake pad replacement',
          cost: 300,
          startDate: new Date()
        })
      });
      const ext4MaintData = await ext4MaintRes.json();

      if (ext4MaintRes.status !== 201) {
        extFail('EXT-4: Maintenance In Shop lock + dispatch block', `Maintenance creation failed: status ${ext4MaintRes.status}`);
      } else {
        const ext4MaintLogId = ext4MaintData.log._id;

        // Confirm vehicle is In Shop
        const ext4VehRes = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
          headers: { 'Authorization': `Bearer ${managerToken}` }
        });
        const ext4VehData = await ext4VehRes.json();
        const inShop = ext4VehData.vehicle.status === 'In Shop';

        // Create a draft trip (should fail because vehicle is In Shop)
        const ext4TripRes = await fetch(`${baseUrl}/trips`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
          body: JSON.stringify({
            source: 'Depot X',
            destination: 'Hub Y',
            vehicleId,
            driverId,
            cargoWeight: 2000,
            plannedDistance: 100
          })
        });
        const dispatchBlocked = ext4TripRes.status === 400;

        if (inShop && dispatchBlocked) {
          extPass('EXT-4: Maintenance In Shop lock + dispatch block');
          console.log(`  Vehicle status: ${ext4VehData.vehicle.status}`);
        } else {
          extFail('EXT-4: Maintenance In Shop lock + dispatch block',
            `InShop=${inShop}, DispatchBlocked=${dispatchBlocked}`);
        }

        // Store for EXT-5
        var ext4StoredMaintLogId = ext4MaintLogId;
      }

      // ----------------------------------------------------
      // EXT-5: Close maintenance — confirm vehicle returns to Available
      // ----------------------------------------------------
      console.log('\n[EXT-5] Close maintenance, confirm vehicle returns to Available...');
      if (ext4StoredMaintLogId) {
        const ext5CloseRes = await fetch(`${baseUrl}/maintenance/${ext4StoredMaintLogId}/close`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
          body: JSON.stringify({ endDate: new Date() })
        });

        if (ext5CloseRes.status !== 200) {
          extFail('EXT-5: Close maintenance restores Available', `Close failed: status ${ext5CloseRes.status}`);
        } else {
          const ext5VehRes = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
            headers: { 'Authorization': `Bearer ${managerToken}` }
          });
          const ext5VehData = await ext5VehRes.json();
          if (ext5VehData.vehicle.status === 'Available') {
            extPass('EXT-5: Close maintenance restores Available');
          } else {
            extFail('EXT-5: Close maintenance restores Available',
              `Expected Available, got ${ext5VehData.vehicle.status}`);
          }
        }
      } else {
        extFail('EXT-5: Close maintenance restores Available', 'No maintenance log ID from EXT-4');
      }

      // ----------------------------------------------------
      // EXT-6: Invalid state transitions
      // ----------------------------------------------------
      console.log('\n[EXT-6] Invalid state transitions — complete a Draft, dispatch a Completed...');

      // 6a: Create a Draft trip and try to complete it directly
      const ext6DraftRes = await fetch(`${baseUrl}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
        body: JSON.stringify({
          source: 'Depot Q',
          destination: 'Hub R',
          vehicleId,
          driverId,
          cargoWeight: 4000,
          plannedDistance: 180
        })
      });
      const ext6DraftData = await ext6DraftRes.json();
      const ext6DraftTripId = ext6DraftData.trip._id;

      const ext6CompDraftRes = await fetch(`${baseUrl}/trips/${ext6DraftTripId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
        body: JSON.stringify({ actualDistance: 100, fuelConsumed: 20, revenue: 1000, fuelCost: 40 })
      });
      const completeDraftBlocked = ext6CompDraftRes.status === 400;

      // 6b: Try to dispatch the already-Completed trip (ext1TripId from EXT-1)
      const ext6DispCompRes = await fetch(`${baseUrl}/trips/${ext1TripId}/dispatch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` }
      });
      const dispatchCompletedBlocked = ext6DispCompRes.status === 400;

      if (completeDraftBlocked && dispatchCompletedBlocked) {
        extPass('EXT-6: Invalid state transitions rejected');
        console.log(`  Complete Draft → 400 ✓`);
        console.log(`  Dispatch Completed → 400 ✓`);
      } else {
        extFail('EXT-6: Invalid state transitions rejected',
          `CompleteDraft=${completeDraftBlocked}, DispatchCompleted=${dispatchCompletedBlocked}`);
      }

    } catch (extError) {
      console.error(`\n❌ Extended test suite error: ${extError.message}`);
      extFail('Extended test suite', extError.message);
    }

    // Print extended test summary
    console.log('\n============================================');
    console.log('EXTENDED TEST SUMMARY');
    console.log('============================================');
    const extPassed = extResults.filter(r => r.passed).length;
    const extTotal = extResults.length;
    extResults.forEach(r => {
      console.log(`  ${r.passed ? '✓' : '✗'} ${r.name}${r.reason ? ` — ${r.reason}` : ''}`);
    });
    console.log(`\n  Result: ${extPassed}/${extTotal} passed`);
    if (extPassed < extTotal) {
      console.log('  ⚠ Some extended tests failed!');
    } else {
      console.log('  🎉 All extended tests passed!');
    }
    console.log('============================================\n');

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
    }

    // ----------------------------------------------------
    // TEST 23: Register SafetyOfficer and FinancialAnalyst
    // ----------------------------------------------------
    console.log('\n[TEST 23] Admin registers Safety Officer and Financial Analyst users...');
    const safetyRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Officer Sarah',
        email: 'sarah.safety@transitops.com',
        password: 'safetypassword123',
        role: 'SafetyOfficer'
      })
    });
    if (safetyRes.status !== 201) {
      throw new Error(`Failed to register Safety Officer: ${await safetyRes.text()}`);
    }

    const financeRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Analyst Fred',
        email: 'fred.finance@transitops.com',
        password: 'financepassword123',
        role: 'FinancialAnalyst'
      })
    });
    if (financeRes.status !== 201) {
      throw new Error(`Failed to register Financial Analyst: ${await financeRes.text()}`);
    }
    console.log('✓ Safety Officer and Financial Analyst users registered successfully.');

    // ----------------------------------------------------
    // TEST 24: Safety Officer logins and updates safetyScore
    // ----------------------------------------------------
    console.log('\n[TEST 24] Logging in as Safety Officer & updating safetyScore...');
    const safetyLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.safety@transitops.com',
        password: 'safetypassword123'
      })
    });
    const safetyLoginData = await safetyLoginRes.json();
    const safetyToken = safetyLoginData.accessToken;

    const safetyUpdateRes = await fetch(`${baseUrl}/drivers/${driverId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${safetyToken}`
      },
      body: JSON.stringify({ safetyScore: 92 })
    });
    const safetyUpdateData = await safetyUpdateRes.json();
    if (safetyUpdateRes.status === 200 && safetyUpdateData.driver.safetyScore === 92) {
      console.log('✓ Safety Officer successfully updated driver safetyScore.');
    } else {
      throw new Error(`Failed Safety Officer update: ${JSON.stringify(safetyUpdateData)}`);
    }

    // ----------------------------------------------------
    // TEST 25: Safety Officer attempts driver delete (restricted)
    // ----------------------------------------------------
    console.log('\n[TEST 25] Testing Safety Officer delete restriction on driver profile...');
    const safetyDelRes = await fetch(`${baseUrl}/drivers/${driverId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${safetyToken}`
      }
    });
    const safetyDelData = await safetyDelRes.json();
    if (safetyDelRes.status === 403) {
      console.log(`✓ Safety Officer block works (403 Forbidden). Msg: "${safetyDelData.error}"`);
    } else {
      throw new Error(`Failed Safety Officer delete restriction test: Status code: ${safetyDelRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 26: Financial Analyst login & read operational reports
    // ----------------------------------------------------
    console.log('\n[TEST 26] Logging in as Financial Analyst & retrieving reports...');
    const financeLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'fred.finance@transitops.com',
        password: 'financepassword123'
      })
    });
    const financeLoginData = await financeLoginRes.json();
    const analystToken = financeLoginData.accessToken;

    // Check dashboard
    const analystDashRes = await fetch(`${baseUrl}/reports/dashboard`, {
      headers: { 'Authorization': `Bearer ${analystToken}` }
    });
    
    // Check ROI
    const analystRoiRes = await fetch(`${baseUrl}/reports/vehicle-roi`, {
      headers: { 'Authorization': `Bearer ${analystToken}` }
    });

    // Check operational-costs
    const analystCostsRes = await fetch(`${baseUrl}/finance/operational-costs`, {
      headers: { 'Authorization': `Bearer ${analystToken}` }
    });

    if (analystDashRes.status === 200 && analystRoiRes.status === 200 && analystCostsRes.status === 200) {
      console.log('✓ Financial Analyst successfully accessed dashboard, ROI, and operational cost reports.');
    } else {
      throw new Error(`Failed Financial Analyst report checks: Dash: ${analystDashRes.status}, ROI: ${analystRoiRes.status}, Costs: ${analystCostsRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 27: Financial Analyst attempts POST /vehicles (restricted)
    // ----------------------------------------------------
    console.log('\n[TEST 27] Testing Financial Analyst vehicle creation restriction...');
    const analystVehicleRes = await fetch(`${baseUrl}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${analystToken}`
      },
      body: JSON.stringify({
        registrationNumber: 'TRUCK-ABC',
        name: 'Heavy Duty Trailer',
        model: 'V8',
        type: 'Trailer',
        maxLoadCapacity: 25000,
        odometer: 100,
        acquisitionCost: 150000
      })
    });
    const analystVehicleData = await analystVehicleRes.json();
    if (analystVehicleRes.status === 403) {
      console.log(`✓ Financial Analyst vehicle create blocked with 403. Msg: "${analystVehicleData.error}"`);
    } else {
      throw new Error(`Failed Financial Analyst restriction check: status ${analystVehicleRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 28: Trip Dispatch and Cancellation workflow
    // ----------------------------------------------------
    console.log('\n[TEST 28] Dispatching and Cancelling a Trip...');
    
    // Create new Trip Draft
    const cancelTripCreateRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        source: 'Depot X',
        destination: 'Depot Y',
        vehicleId,
        driverId,
        cargoWeight: 5000,
        plannedDistance: 120
      })
    });
    const cancelTripCreateData = await cancelTripCreateRes.json();
    const cTripId = cancelTripCreateData.trip._id;

    // Dispatch it
    await fetch(`${baseUrl}/trips/${cTripId}/dispatch`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      }
    });

    // Cancel it
    const cancelRes = await fetch(`${baseUrl}/trips/${cTripId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      }
    });
    const cancelData = await cancelRes.json();

    if (cancelRes.status === 200 && cancelData.trip.status === 'Cancelled') {
      console.log('✓ Trip status is Cancelled.');
      
      // Verify vehicle status
      const vCheckCancel = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const vCheckCancelData = await vCheckCancel.json();
      console.log(`  Vehicle Status: ${vCheckCancelData.vehicle.status} (Expected: Available)`);

      // Verify driver status
      const dCheckCancel = await fetch(`${baseUrl}/drivers/${driverId}`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const dCheckCancelData = await dCheckCancel.json();
      console.log(`  Driver Status: ${dCheckCancelData.driver.status} (Expected: Available)`);

      if (vCheckCancelData.vehicle.status !== 'Available' || dCheckCancelData.driver.status !== 'Available') {
        throw new Error('Driver/Vehicle did not return to Available status after trip cancellation');
      }
      console.log('✓ Vehicle and driver restored to Available successfully.');
    } else {
      throw new Error(`Failed trip cancellation flow: status ${cancelRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 29: Manual Fuel and Expense entry logging
    // ----------------------------------------------------
    console.log('\n[TEST 29] Logging manual fuel and expense entries...');
    
    // Log Fuel
    const manualFuelRes = await fetch(`${baseUrl}/finance/fuel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${analystToken}`
      },
      body: JSON.stringify({
        vehicleId,
        liters: 100,
        cost: 200
      })
    });
    
    // Log Expense
    const manualExpenseRes = await fetch(`${baseUrl}/finance/expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${analystToken}`
      },
      body: JSON.stringify({
        vehicleId,
        type: 'Toll',
        amount: 50,
        description: 'Bridge Toll Fee'
      })
    });

    if (manualFuelRes.status === 201 && manualExpenseRes.status === 201) {
      console.log('✓ Manual fuel and expense logs created successfully.');
      
      // Pull operational costs and check if fuel increased (90 from completed trip + 200 manual = 290 total)
      const costRes2 = await fetch(`${baseUrl}/finance/operational-costs`, {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const costData2 = await costRes2.json();
      const volvoCost = costData2.operationalCosts.find(c => c.registrationNumber === 'TRUCK-7788');
      
      console.log(`  Fuel cost compiled: $${volvoCost.fuelCost} (Expected: 366)`);
      console.log(`  Total operational cost compiled: $${volvoCost.totalOperationalCost} (Expected: 1116)`);
      
      if (volvoCost.fuelCost !== 366 || volvoCost.totalOperationalCost !== 1116) {
        throw new Error('Manual operational cost additions were not reflected in aggregations.');
      }
    } else {
      throw new Error(`Failed manual logging checks: Fuel status ${manualFuelRes.status}, Expense status ${manualExpenseRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 30: Dashboard Filtering Verification
    // ----------------------------------------------------
    console.log('\n[TEST 30] Verifying Dashboard filters...');
    const matchFilterRes = await fetch(`${baseUrl}/reports/dashboard?type=Heavy+Truck&status=Available&region=North`, {
      headers: { 'Authorization': `Bearer ${managerToken}` }
    });
    const matchFilterData = await matchFilterRes.json();
    console.log(`  Vehicles matching filter: ${matchFilterData.meta.totalVehicles} (Expected: 1)`);

    const mismatchFilterRes = await fetch(`${baseUrl}/reports/dashboard?type=Van&status=Available&region=North`, {
      headers: { 'Authorization': `Bearer ${managerToken}` }
    });
    const mismatchFilterData = await mismatchFilterRes.json();
    console.log(`  Vehicles mismatching filter: ${mismatchFilterData.meta.totalVehicles} (Expected: 0)`);

    if (matchFilterData.meta.totalVehicles === 1 && mismatchFilterData.meta.totalVehicles === 0) {
      console.log('✓ Dashboard query filters correctly narrow down the counts.');
    } else {
      throw new Error('Dashboard filters failed to restrict vehicle queries.');
    }

    // ----------------------------------------------------
    // TEST 31: Trips Query Filtering by driverId
    // ----------------------------------------------------
    console.log('\n[TEST 31] Verifying Trips query parameter filters...');
    const driverTripsRes = await fetch(`${baseUrl}/trips?driverId=${driverId}`, {
      headers: { 'Authorization': `Bearer ${managerToken}` }
    });
    const driverTripsData = await driverTripsRes.json();
    console.log(`  Trips matching driver ID: ${driverTripsData.count} (Expected: 5)`);

    const emptyTripsRes = await fetch(`${baseUrl}/trips?driverId=${expiredDriverId}`, {
      headers: { 'Authorization': `Bearer ${managerToken}` }
    });
    const emptyTripsData = await emptyTripsRes.json();
    console.log(`  Trips matching unused driver ID: ${emptyTripsData.count} (Expected: 0)`);

    if (driverTripsData.count === 5 && emptyTripsData.count === 0) {
      console.log('✓ Trips query filtering successfully limits returned records.');
    } else {
      throw new Error(`Trips query filtering failed. Expected 5 and 0, got ${driverTripsData.count} and ${emptyTripsData.count}`);
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

    // ----------------------------------------------------
    // TEST 32: PUT Vehicle and Driver updates as FleetManager
    // ----------------------------------------------------
    console.log('\n[TEST 32] Testing PUT /api/vehicles/:id and PUT /api/drivers/:id as FleetManager...');
    
    // Update Vehicle
    const updateVehicleRes = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        model: 'Volvo 9400 Intercity Gen-X',
        maxLoadCapacity: 16000
      })
    });
    const updateVehicleData = await updateVehicleRes.json();
    if (updateVehicleRes.status !== 200) {
      throw new Error(`Failed to update vehicle: ${JSON.stringify(updateVehicleData)}`);
    }
    
    // Retrieve vehicle and confirm changes persist
    const checkVehicleRes = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
      headers: { 'Authorization': `Bearer ${managerToken}` }
    });
    const checkVehicleData = await checkVehicleRes.json();
    if (checkVehicleData.vehicle.model !== 'Volvo 9400 Intercity Gen-X' || checkVehicleData.vehicle.maxLoadCapacity !== 16000) {
      throw new Error(`Vehicle updates did not persist. Found model: ${checkVehicleData.vehicle.model}, capacity: ${checkVehicleData.vehicle.maxLoadCapacity}`);
    }
    console.log('✓ Vehicle updates successfully persisted.');

    // Update Driver
    const updateDriverRes = await fetch(`${baseUrl}/drivers/${driverId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        name: 'Dev Mehta Jr',
        contactNumber: '+919999999999'
      })
    });
    const updateDriverData = await updateDriverRes.json();
    if (updateDriverRes.status !== 200) {
      throw new Error(`Failed to update driver: ${JSON.stringify(updateDriverData)}`);
    }

    // Retrieve driver and confirm changes persist
    const checkDriverRes = await fetch(`${baseUrl}/drivers/${driverId}`, {
      headers: { 'Authorization': `Bearer ${managerToken}` }
    });
    const checkDriverData = await checkDriverRes.json();
    if (checkDriverData.driver.name !== 'Dev Mehta Jr' || checkDriverData.driver.contactNumber !== '+919999999999') {
      throw new Error(`Driver updates did not persist. Found name: ${checkDriverData.driver.name}, contact: ${checkDriverData.driver.contactNumber}`);
    }
    console.log('✓ Driver updates successfully persisted.');

    // ----------------------------------------------------
    // TEST 33: Set vehicle status to "Retired" and confirm exclusions
    // ----------------------------------------------------
    console.log('\n[TEST 33] Setting vehicle status to Retired and confirming trip creation/dispatch block...');
    
    // Set status to Retired
    const retireVehicleRes = await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        status: 'Retired'
      })
    });
    const retireVehicleData = await retireVehicleRes.json();
    if (retireVehicleRes.status !== 200 || retireVehicleData.vehicle.status !== 'Retired') {
      throw new Error(`Failed to set vehicle status to Retired: ${JSON.stringify(retireVehicleData)}`);
    }

    // Try to create a trip with this Retired vehicle
    const retiredTripRes = await fetch(`${baseUrl}/trips`, {
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
    const retiredTripData = await retiredTripRes.json();
    if (retiredTripRes.status === 400) {
      console.log(`✓ Rejection of Retired vehicle trip assignment works. Msg: "${retiredTripData.error}"`);
    } else {
      throw new Error(`Failed Retired vehicle assignment guard: Should have blocked vehicle, status code: ${retiredTripRes.status}`);
    }

    // Restore vehicle to Available for any potential subsequent tests
    await fetch(`${baseUrl}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({ status: 'Available' })
    });

    // ----------------------------------------------------
    // TEST 34: Test token refresh flow
    // ----------------------------------------------------
    console.log('\n[TEST 34] Testing token refresh flow...');
    
    // Use an expired/invalid access token to request protected route
    const badAccessRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${managerToken}x` } // invalid token
    });
    if (badAccessRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for invalid access token, got ${badAccessRes.status}`);
    }
    console.log('✓ Invalid access token correctly rejected with 401.');

    // Call POST /api/auth/token with a valid refresh token
    const refreshRes = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: managerRefreshToken })
    });
    const refreshData = await refreshRes.json();
    if (refreshRes.status !== 200 || !refreshData.accessToken) {
      throw new Error(`Failed to refresh token: status ${refreshRes.status}, data ${JSON.stringify(refreshData)}`);
    }
    console.log('✓ New access token successfully issued.');

    // Confirm new access token works on a subsequent request
    const goodAccessRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${refreshData.accessToken}` }
    });
    const goodAccessData = await goodAccessRes.json();
    if (goodAccessRes.status !== 200 || goodAccessData.user.email !== 'bob.manager@transitops.com') {
      throw new Error(`Failed to authenticate with refreshed token: status ${goodAccessRes.status}, data ${JSON.stringify(goodAccessData)}`);
    }
    console.log('✓ Refreshed access token successfully authenticated.');

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
