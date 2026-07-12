# Backend API Integration Guide

## ✅ Completed Pages

### 1. Login Page (`src/pages/Login.jsx`)
- **Status**: ✅ DONE
- **API Endpoints**: POST `/auth/login`
- **Features**:
  - Real authentication with JWT tokens
  - Token storage in localStorage
  - Error handling from backend `error` key
  - Async form submission

### 2. VehicleRegistry Page (`src/pages/VehicleRegistry.jsx`)
- **Status**: ✅ DONE  
- **API Endpoints**: 
  - GET `/vehicles` (fetch all)
  - POST `/vehicles` (create)
  - DELETE `/vehicles/:id` (delete)
- **Features**:
  - Loads real vehicle data on mount
  - Create new vehicles with backend validation
  - Delete vehicles with confirmation
  - Error display from backend `error` key

---

## 🔄 Pages Requiring Integration

### 3. DriverManagement Page

**API Integration Required**:
```javascript
import { driversAPI } from '../api/drivers';

// In component:
const [drivers, setDrivers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await driversAPI.getAll();
      setDrivers(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };
  loadDrivers();
}, []);

// Create driver
const handleCreate = async (driverData) => {
  try {
    const newDriver = await driversAPI.create(driverData);
    setDrivers(prev => [newDriver, ...prev]);
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to create driver');
  }
};

// Update driver
const handleUpdate = async (id, updates) => {
  try {
    const updated = await driversAPI.update(id, updates);
    setDrivers(prev => prev.map(d => d._id === id ? updated : d));
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to update driver');
  }
};
```

**Backend Schema Reference**:
```javascript
{
  name: String,
  licenseNumber: String,
  licenseExpiry: Date,
  phoneNumber: String,
  status: 'Active' | 'Inactive' | 'On Leave',
}
```

---

### 4. TripManagement Page

**API Integration Required**:
```javascript
import { tripsAPI } from '../api/trips';

// Load trips
useEffect(() => {
  const loadTrips = async () => {
    try {
      const data = await tripsAPI.getAll();
      setTrips(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load trips');
    }
  };
  loadTrips();
}, []);

// Create trip
const handleCreate = async (tripData) => {
  try {
    const newTrip = await tripsAPI.create({
      vehicleId: tripData.vehicleId, // Must be valid vehicle _id
      driverId: tripData.driverId,   // Must be valid driver _id
      source: tripData.source,
      destination: tripData.destination,
      cargoWeight: parseFloat(tripData.cargoWeight),
      distance: parseFloat(tripData.distance),
    });
    setTrips(prev => [newTrip, ...prev]);
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to create trip');
  }
};

// Dispatch trip
const handleDispatch = async (tripId) => {
  try {
    const updated = await tripsAPI.dispatch(tripId);
    setTrips(prev => prev.map(t => t._id === tripId ? updated : t));
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to dispatch trip');
  }
};

// Complete trip
const handleComplete = async (tripId, actualDistance, fuelConsumed) => {
  try {
    const updated = await tripsAPI.complete(tripId, {
      actualDistance: parseFloat(actualDistance),
      fuelConsumed: parseFloat(fuelConsumed),
    });
    setTrips(prev => prev.map(t => t._id === tripId ? updated : t));
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to complete trip');
  }
};

// Cancel trip
const handleCancel = async (tripId, reason) => {
  try {
    const updated = await tripsAPI.cancel(tripId, reason);
    setTrips(prev => prev.map(t => t._id === tripId ? updated : t));
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to cancel trip');
  }
};
```

**Backend Schema**:
```javascript
{
  vehicleId: ObjectId (ref: Vehicle),
  driverId: ObjectId (ref: Driver),
  source: String,
  destination: String,
  cargoWeight: Number,
  distance: Number,
  status: 'Draft' | 'Dispatched' | 'On Route' | 'Completed' | 'Cancelled',
  actualDistance: Number (only when completed),
  fuelConsumed: Number (only when completed),
}
```

---

### 5. MaintenanceManagement Page

**API Integration Required**:
```javascript
import { maintenanceAPI } from '../api/maintenance';

// Load maintenance logs
useEffect(() => {
  const loadLogs = async () => {
    try {
      const data = await maintenanceAPI.getAll();
      setLogs(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load maintenance logs');
    }
  };
  loadLogs();
}, []);

// Create maintenance log
const handleCreate = async (logData) => {
  try {
    const newLog = await maintenanceAPI.create({
      vehicleId: logData.vehicleId, // Must be valid vehicle _id
      maintenanceType: logData.type, // 'Scheduled' | 'Repair' | 'Inspection'
      description: logData.description,
      cost: parseFloat(logData.cost),
      maintenanceDate: logData.date,
    });
    setLogs(prev => [newLog, ...prev]);
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to create maintenance log');
  }
};

// Close maintenance
const handleClose = async (logId, resolutionNotes) => {
  try {
    const updated = await maintenanceAPI.close(logId, { resolutionNotes });
    setLogs(prev => prev.map(log => log._id === logId ? updated : log));
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to close maintenance');
  }
};
```

---

### 6. FuelExpenseManagement Page

**API Integration Required**:
```javascript
import { financeAPI } from '../api/finance';

// Load fuel logs and expenses
useEffect(() => {
  const loadFinanceData = async () => {
    try {
      const [fuelData, expenseData] = await Promise.all([
        financeAPI.getAllFuelLogs(),
        financeAPI.getAllExpenses(),
      ]);
      setFuelLogs(fuelData);
      setExpenses(expenseData);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load finance data');
    }
  };
  loadFinanceData();
}, []);

// Create fuel log
const handleFuelLog = async (fuelData) => {
  try {
    const newLog = await financeAPI.createFuelLog({
      vehicleId: fuelData.vehicleId,
      fuelQuantity: parseFloat(fuelData.quantity),
      costPerLitre: parseFloat(fuelData.costPerLitre),
      fuelDate: fuelData.date,
    });
    setFuelLogs(prev => [newLog, ...prev]);
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to create fuel log');
  }
};

// Create expense
const handleExpense = async (expenseData) => {
  try {
    const newExpense = await financeAPI.createExpense({
      vehicleId: expenseData.vehicleId,
      expenseType: expenseData.type, // 'Toll' | 'Parking' | 'Fine' | 'Other'
      amount: parseFloat(expenseData.amount),
      description: expenseData.description,
      expenseDate: expenseData.date,
    });
    setExpenses(prev => [newExpense, ...prev]);
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to create expense');
  }
};
```

---

### 7. Dashboard Page

**API Integration Required**:
```javascript
import { reportsAPI } from '../api/reports';

// Load dashboard data
useEffect(() => {
  const loadDashboard = async () => {
    try {
      const data = await reportsAPI.getDashboard();
      setStats(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load dashboard');
    }
  };
  loadDashboard();
}, []);
```

**Dashboard Response Structure**:
```javascript
{
  totalVehicles: Number,
  activeTrips: Number,
  completedTrips: Number,
  totalDrivers: Number,
  activeDrivers: Number,
  totalRevenue: Number,
  totalExpenses: Number,
  totalFuelCost: Number,
  averageTripDistance: Number,
}
```

---

### 8. AnalyticsDashboard Page (Reports)

**API Integration Required**:
```javascript
import { reportsAPI } from '../api/reports';
import { financeAPI } from '../api/finance';

// Load reports data
useEffect(() => {
  const loadReports = async () => {
    try {
      const [dashboardData, roiData, costsData] = await Promise.all([
        reportsAPI.getDashboard(),
        reportsAPI.getVehicleROI(),
        financeAPI.getOperationalCosts(),
      ]);
      setDashboard(dashboardData);
      setVehicleROI(roiData);
      setCosts(costsData);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load reports');
    }
  };
  loadReports();
}, []);

// Export CSV
const handleExport = async (reportType, startDate, endDate) => {
  try {
    const blob = await reportsAPI.exportCSV(reportType, startDate, endDate);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString()}.csv`;
    a.click();
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to export report');
  }
};
```

---

## Important Notes

### Error Handling Pattern
Always extract the `error` key from backend responses:
```javascript
try {
  // API call
} catch (err) {
  const errorMessage = err.response?.data?.error || 'Generic fallback message';
  alert(errorMessage); // or setError(errorMessage) for form errors
}
```

### Token Management
- Tokens are automatically attached by axios interceptor
- Refresh happens automatically on 401
- Logout redirects to /login automatically

### Backend Field Mapping
- Backend uses `_id` for IDs (MongoDB)
- Frontend should map accordingly
- Use ObjectId strings for references (vehicleId, driverId)

### Testing Checklist
- [ ] Login with real credentials
- [ ] Create/Read/Update/Delete operations
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Token refresh on 401
- [ ] Logout clears tokens

---

## Summary Status

| Page | Status | Endpoints Used |
|------|--------|----------------|
| Login | ✅ DONE | POST /auth/login |
| VehicleRegistry | ✅ DONE | GET/POST/DELETE /vehicles |
| DriverManagement | 🔄 TODO | GET/POST/PUT/DELETE /drivers |
| TripManagement | 🔄 TODO | GET/POST /trips, PUT /trips/:id/dispatch, /complete, /cancel |
| Maintenance | 🔄 TODO | GET/POST /maintenance, PUT /maintenance/:id/close |
| Finance | 🔄 TODO | GET/POST /finance/fuel, GET/POST /finance/expense |
| Dashboard | 🔄 TODO | GET /reports/dashboard |
| Analytics | 🔄 TODO | GET /reports/dashboard, /vehicle-roi, /finance/operational-costs |

