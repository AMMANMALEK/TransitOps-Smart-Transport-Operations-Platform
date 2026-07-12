## Prerequisites
- ✅ Node.js (v18+)
- ✅ MongoDB running locally on port 27017
- ✅ Test users created in database

---

## 🎯 Step-by-Step Launch

### 1. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if installed as service)
net start MongoDB

# Or run manually
mongod --dbpath "C:\data\db"

# macOS/Linux
sudo systemctl start mongod
# or
mongod --dbpath /data/db
```

### 2. Start Backend Server
```bash
cd TransitOps-Smart-Transport-Operations-Platform/backend
npm install  # First time only
npm run dev  # Development with nodemon
```

**Backend should now be running at:** `http://localhost:5000`

**Verify backend is ready:**
```bash
curl http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@transitops.com\",\"password\":\"Admin@123\"}"
```

### 3. Start Frontend Development Server
Open a **new terminal** and run:
```bash
cd TransitOps-Smart-Transport-Operations-Platform/frontend
npm install  # First time only
npm run dev
```

**Frontend should now be running at:** `http://localhost:5173`

---

## 🔐 Login to the System

1. Open browser: `http://localhost:5173`
2. Click **"Show Test Credentials"** button on login page
3. Click any test user to auto-fill credentials
4. Click **"Sign In"**

### Test Credentials Quick Reference

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@transitops.com | Admin@123 |
| Fleet Manager | fleet@transitops.com | Fleet@123 |
| Driver | driver@transitops.com | Driver@123 |
| Safety Officer | safety@transitops.com | Safety@123 |
| Financial Analyst | finance@transitops.com | Finance@123 |

---

## ✅ Verification Checklist

### Backend Health Check
- [ ] MongoDB connection successful
- [ ] Backend server running on port 5000
- [ ] Users seeded in database
- [ ] Login endpoint responding

Test:
```bash
curl http://localhost:5000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@transitops.com","password":"Admin@123"}'
```

Expected response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@transitops.com",
    "role": "Admin"
  }
}
```

### Frontend Health Check
- [ ] Frontend dev server running on port 5173
- [ ] Can access login page
- [ ] Test credentials button visible
- [ ] Can click a test user to auto-fill
- [ ] Can successfully login
- [ ] Redirected to appropriate page based on role

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: Cannot connect to MongoDB
```
Solution: Ensure MongoDB is running
- Check: Run `mongosh` or `mongo` command
- Fix: Start MongoDB service
```

**Issue**: Port 5000 already in use
```
Solution: Change port in backend/.env
PORT=5001  # Use different port
```

**Issue**: Users not found / Login fails
```
Solution: Re-seed users
cd backend
node seedUsers.js
```

### Frontend Issues

**Issue**: Network Error / Cannot reach backend
```
Solution: Check backend is running and .env is correct
- Verify: http://localhost:5000/api/auth/login exists
- Check: frontend/.env has VITE_API_BASE_URL=http://localhost:5000/api
```

**Issue**: 401 Unauthorized on API calls
```
Solution: Token might be expired
- Clear localStorage in browser DevTools
- Login again
```

**Issue**: CORS errors
```
Solution: Backend has CORS enabled for localhost:5173
- Check backend is running on correct port
- Verify no other service is on port 5173
```

---

## 📁 Project Structure

```
TransitOps-Smart-Transport-Operations-Platform/
├── backend/
│   ├── src/
│   │   ├── features/      # API endpoints
│   │   ├── middleware/    # Auth, RBAC, errors
│   │   ├── services/      # Business logic
│   │   └── config/        # DB connection
│   ├── .env               # Backend config
│   ├── seedUsers.js       # User creation script
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/           # ✅ NEW: API service layer
│   │   ├── pages/         # Route components
│   │   ├── components/    # Reusable UI
│   │   └── context/       # ✅ UPDATED: Real API state
│   ├── .env               # Frontend config
│   └── package.json
│
├── TEST_CREDENTIALS.md    # ✅ All test user info
└── QUICK_START.md        # ✅ This file
```

---

## 🎯 Next Steps

### For Development
1. ✅ Backend running with real MongoDB
2. ✅ Frontend connected to backend API
3. 🔄 Complete remaining page integrations (see INTEGRATION_GUIDE.md)
4. 🔄 Test all CRUD operations
5. 🔄 Verify RBAC permissions per role
6. 🔄 Test error handling and validation

### Integration Status
- ✅ Login Page (Real API)
- ✅ VehicleRegistry (Real API)
- 🔄 DriverManagement (TODO)
- 🔄 TripManagement (TODO)
- 🔄 Maintenance (TODO)
- 🔄 Finance (TODO)
- 🔄 Dashboard (TODO)
- 🔄 Analytics (TODO)

See `INTEGRATION_GUIDE.md` for detailed instructions on wiring remaining pages.

---

## 🚨 Important Notes

- **Backend must be running** before frontend can function
- **MongoDB must be running** before backend can start
- **Users must be seeded** before login works
- Token auto-refresh is handled automatically
- RBAC is enforced on backend, not just frontend
- All forms display backend validation errors from `error` key

---

## 📞 Support

If issues persist:
1. Check both terminal outputs for errors
2. Verify MongoDB is accessible: `mongosh`
3. Test backend directly with curl
4. Check browser console for frontend errors
5. Clear browser cache and localStorage
6. Re-seed users if login fails

**All systems green?** You're ready to demo! 🎉
