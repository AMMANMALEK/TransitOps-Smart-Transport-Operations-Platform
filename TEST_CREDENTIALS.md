# TransitOps Test User Credentials

## 🔐 Login Credentials for Testing

All users have been created in the MongoDB database and can be used to log in to the system.

### User Accounts

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Admin** | Admin User | `admin@transitops.com` | `Admin@123` |
| **Fleet Manager** | Rahul Sharma | `fleet@transitops.com` | `Fleet@123` |
| **Driver** | Dev Mehta | `driver@transitops.com` | `Driver@123` |
| **Safety Officer** | Priya Nair | `safety@transitops.com` | `Safety@123` |
| **Financial Analyst** | Meera Kapoor | `finance@transitops.com` | `Finance@123` |

---

## 🎭 Role Permissions

### 1. Admin (`Admin`)
- **Full system access**
- Complete CRUD on all resources
- User management
- All reports and analytics

### 2. Fleet Manager (`FleetManager`)
- Manage vehicles (CRUD)
- Manage drivers (CRUD)
- Create, dispatch, complete trips
- View maintenance logs
- Access all reports
- Manage fuel logs and expenses

### 3. Driver (`Driver`)
- View assigned vehicles
- Create and view trips
- Update trip status
- Log fuel purchases
- View personal stats

### 4. Safety Officer (`SafetyOfficer`)
- View all vehicles
- Manage drivers (CRUD except delete)
- View trips
- Create and manage maintenance logs
- Monitor safety compliance
- Cannot delete drivers (restricted)

### 5. Financial Analyst (`FinancialAnalyst`)
- View vehicles (read-only)
- View trips (read-only)
- Full access to fuel logs
- Full access to expenses
- Access to all financial reports
- ROI analysis
- Export CSV reports

---

## 🧪 Testing Workflow

### Test Login
1. Navigate to `http://localhost:5173/login`
2. Use any of the credentials above
3. System will redirect based on role:
   - **Admin/FleetManager** → Dashboard
   - **Driver** → Trips page
   - **SafetyOfficer** → Drivers page
   - **FinancialAnalyst** → Expenses page

### Test API Directly
```bash
# Login to get access token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fleet@transitops.com",
    "password": "Fleet@123"
  }'

# Use the returned accessToken in subsequent requests
curl -X GET http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🔄 Re-seeding Users

If you need to reset the users or add new ones, run:

```bash
cd backend
node seedUsers.js
```

This will:
1. Clear all existing users
2. Create the 5 default test accounts
3. Display the credentials

---

## 📝 Notes

- All passwords follow the pattern: `RoleName@123`
- Passwords are hashed using bcrypt with salt rounds = 10
- JWT tokens expire after 15 minutes (access) and 7 days (refresh)
- Token refresh is automatic via axios interceptor in frontend
- Backend enforces RBAC on all protected routes

---

## ⚠️ Security Reminder

**IMPORTANT**: These are test credentials for development only. 

For production:
- Change all default passwords
- Use strong, unique passwords
- Enable 2FA if available
- Rotate JWT secrets
- Use environment-specific credentials
- Never commit real credentials to version control

