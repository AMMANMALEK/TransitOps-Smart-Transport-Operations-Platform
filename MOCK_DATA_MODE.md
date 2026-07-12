# 🎭 Mock Data Mode - Offline Login Enabled

## ✅ Current Configuration

The application now runs **completely with mock data** - no backend or MongoDB connection required!

---

## 🔐 Mock Login Credentials

You can login with these credentials (no backend needed):

| Role | Email | Password |
|------|-------|----------|
| **Admin / Fleet Manager** | admin@transitops.com | Admin@123 |
| **Fleet Manager** | fleet@transitops.com | Fleet@123 |
| **Driver** | driver@transitops.com | Driver@123 |
| **Safety Officer** | safety@transitops.com | Safety@123 |
| **Financial Analyst** | finance@transitops.com | Finance@123 |

---

## 🚀 Quick Start (No Backend)

### 1. Start Frontend Only
```bash
cd TransitOps-Smart-Transport-Operations-Platform/frontend
npm install  # First time only
npm run dev
```

### 2. Open Browser
Navigate to: `http://localhost:5173`

### 3. Login
1. Click **"Show Test Credentials"** button
2. Click any test user to auto-fill
3. Click **"Sign In"**
4. ✅ You're in!

---

## 📊 What Works with Mock Data

### ✅ Fully Functional Pages
- **Login Page** - Mock authentication
- **Vehicle Registry** - Mock CRUD operations
- **Dashboard** - Mock data display
- **All other pages** - Using mock/local state

### 🎯 Features Available
- ✅ Login/Logout (stored in localStorage)
- ✅ Role-based navigation
- ✅ Create/Read/Update/Delete operations
- ✅ Search and filtering
- ✅ Form validation
- ✅ UI interactions

### ⚠️ What Doesn't Work
- ❌ No data persistence (refreshing page resets changes)
- ❌ No real backend validation
- ❌ No actual database storage
- ❌ Data resets on page refresh
- ❌ No cross-user data sharing

---

## 🔄 Switching to Real Backend (When Ready)

The backend API infrastructure is already built and ready. To switch back:

### Option 1: Keep Mock Data (Current)
- No changes needed
- Works offline
- Fast development

### Option 2: Use Real Backend API
1. Start MongoDB: `mongod`
2. Start backend: `cd backend && npm run dev`
3. Update `StateContext.jsx` to use real API (see `INTEGRATION_GUIDE.md`)
4. Update pages to use API services

**All API services are already created:**
- `src/api/auth.js`
- `src/api/vehicles.js`
- `src/api/drivers.js`
- `src/api/trips.js`
- `src/api/maintenance.js`
- `src/api/finance.js`
- `src/api/reports.js`

---

## 💾 Mock Data Storage

### Current Implementation
- **Login**: 5 hardcoded users in `StateContext.jsx`
- **Vehicles**: 8 mock vehicles in `VehicleRegistry.jsx`
- **User Session**: Stored in `localStorage` as `vb_user`
- **All Changes**: In-memory only (lost on refresh)

### Data Locations
```javascript
// User authentication
StateContext.jsx - MOCK_USERS array

// Vehicles
VehicleRegistry.jsx - MOCK_VEHICLES array

// Other pages
Each page has its own initial mock data
```

---

## 🎨 Development Benefits

### Advantages of Mock Data Mode
1. **No Setup Required** - No MongoDB, no backend server
2. **Fast Development** - Instant feedback on UI changes
3. **Offline Work** - Code anywhere without internet
4. **Easy Testing** - Predictable data for UI tests
5. **Quick Demo** - Show UI without infrastructure

### When to Use Mock vs Real
- **Mock Data**: UI development, styling, layout, flows
- **Real Backend**: Business logic, validation, RBAC, persistence

---

## 📝 How Mock Login Works

```javascript
// In StateContext.jsx
const MOCK_USERS = [
  {
    id: 'USR-001',
    name: 'Admin User',
    email: 'admin@transitops.com',
    password: 'Admin@123',
    role: 'fleet_manager',
  },
  // ... more users
];

// Login function (synchronous)
const login = (email, password) => {
  const foundUser = MOCK_USERS.find(
    u => u.email.toLowerCase() === email.toLowerCase() 
      && u.password === password
  );
  
  if (!foundUser) return null;
  
  setUser(foundUser);
  return foundUser;
};
```

---

## 🔧 Customizing Mock Data

### Adding More Mock Users
Edit `frontend/src/context/StateContext.jsx`:
```javascript
const MOCK_USERS = [
  // ... existing users
  {
    id: 'USR-006',
    name: 'Your Name',
    email: 'your@email.com',
    password: 'YourPassword@123',
    role: 'fleet_manager',
  },
];
```

### Adding More Mock Vehicles
Edit `frontend/src/pages/VehicleRegistry.jsx`:
```javascript
const MOCK_VEHICLES = [
  // ... existing vehicles
  {
    _id: '9',
    registrationNumber: 'XX-00-YY-0000',
    model: 'Your Vehicle Model',
    type: 'Bus',
    capacity: '50 seats',
    assignedDriver: 'Driver Name',
    fuelLevel: 80,
    status: 'Available'
  },
];
```

---

## ⚡ Quick Test Flow

1. **Login** → Use any test credential
2. **View Vehicles** → See 8 mock vehicles
3. **Add Vehicle** → Creates in memory
4. **Search/Filter** → Works on mock data
5. **Delete Vehicle** → Removes from memory
6. **Refresh Page** → Data resets to original

---

## 🎯 Perfect For

- ✅ UI/UX development
- ✅ Layout and styling
- ✅ Component testing
- ✅ Demo presentations (offline)
- ✅ Rapid prototyping
- ✅ Frontend-only development

---

## 📞 Support

**Everything working?** You can now:
- Develop UI without backend
- Test all pages and flows
- Make changes and see results instantly
- Demo the app without infrastructure setup

**Ready for backend?** See:
- `INTEGRATION_GUIDE.md` - How to connect to real API
- `QUICK_START.md` - Full setup with backend
- `TEST_CREDENTIALS.md` - Backend user accounts

---

**Current Mode**: 🎭 **MOCK DATA (Offline)**  
**Backend Required**: ❌ **NO**  
**Data Persistence**: ❌ **NO** (resets on refresh)  
**Ready to Demo**: ✅ **YES** (UI only)

