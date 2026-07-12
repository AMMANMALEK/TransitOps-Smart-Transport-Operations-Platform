# TransitOps Backend — Smart Transport Operations Platform

TransitOps is a centralized transport operations backend engineered with Node.js, Express 5, and MongoDB/Mongoose. It manages the complete lifecycle of fleet logistics, from vehicle registration and driver profiles to dispatching, maintenance scheduling, and fuel tracking, all under secure Role-Based Access Control (RBAC).

---

## 🛠️ Stack & Dependencies

* **Runtime & Framework**: Node.js & Express 5 (CommonJS module format).
* **Database & ORM**: MongoDB + Mongoose.
* **Security & Tokens**: JWT (Access and Refresh token flow) + bcryptjs password hashing.
* **Directory Structure**: Feature-based modular design.

---

## 🚀 Getting Started

### 1. Requirements
Ensure you have the following installed:
* Node.js (v18+)
* MongoDB Server (local or Atlas instance)

### 2. Environment Configuration
Create a `.env` file in the root directory (based on the seeded [.env](file:///d:/HACKATHONS/ODOO/Transport_OPS/.env)):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/transitops
JWT_SECRET=transitops_jwt_access_secret_key_change_me_in_prod_123!
JWT_REFRESH_SECRET=transitops_jwt_refresh_secret_key_change_me_in_prod_123!
ADMIN_EMAIL=admin@transitops.com
ADMIN_PASSWORD=admin123
```

### 3. Installation
Install project dependencies:
```bash
npm install
```

### 4. Running the Application
* **Development Mode** (with nodemon):
  ```bash
  npm run dev
  ```
* **Production Mode**:
  ```bash
  npm start
  ```

*On connection to the database, a default **Admin** account is seeded using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` defined in your environment file if no users exist.*

---

## 🛡️ Role-Based Access Control (RBAC)

The system defines five primary roles:
1. `Admin` — Complete super-user access.
2. `FleetManager` — Manages fleet assets, driver profiles, dispatch lifecycle, and reports.
3. `Driver` — Can create and view trips and log fuel purchases.
4. `SafetyOfficer` — Inspects driver licenses, monitors safety scores, and coordinates maintenance.
5. `FinancialAnalyst` — Focuses on fuel logs, operational expense sheets, and ROI reports.

---

## ⚙️ Core Business Rules Enforced

* **Registration Uniqueness**: Vehicle registration numbers and user emails are verified uniquely.
* **Dispatch Blockers**: Vehicles that are **Retired** or **In Shop** (undergoing maintenance) cannot be dispatched.
* **Driver Blockers**: Drivers who are **Suspended** or have an **expired license** cannot be assigned to trips.
* **Conflict Prevention**: Drivers and vehicles already **On Trip** cannot be assigned or dispatched to another trip.
* **Weight Guard**: Cargo weights are validated against the maximum load capacity of the assigned vehicle.
* **State Machine Auto-transitions**:
  * *Dispatching* a trip moves both vehicle and driver status to `On Trip`.
  * *Completing* a trip returns both to `Available` and updates the odometer.
  * *Cancelling* a dispatched trip restores both to `Available`.
  * *Maintenance start* marks the vehicle `In Shop`.
  * *Maintenance close* restores the vehicle to `Available` (unless Retired).

---

## 📂 Feature Directory Structure

```text
src/
├── config/
│   └── db.js                 # Database connection and admin bootstrap seeding
├── middleware/
│   ├── auth.js               # JWT authentication and RBAC middleware
│   └── error.js              # Centralized error handler
├── services/
│   └── businessRules.js      # Central business rules service layer (DRY)
├── features/
│   ├── auth/                 # Sign-in, sign-out, token refresh, registrations
│   ├── vehicles/             # Vehicle registry CRUD
│   ├── drivers/              # Driver management (restricted delete)
│   ├── trips/                # Trips lifecycle (Draft -> Dispatched -> Completed / Cancelled)
│   ├── maintenance/          # Maintenance log tracking
│   ├── finance/              # Fuel purchase logging and operational expense aggregations
│   └── reports/              # Performance dashboards, vehicle ROI, and CSV streams
├── app.js                    # Express app initializer
└── server.js                 # Web server entrypoint
```

---

## 🔌 API Documentation

### 🔑 Authentication (`/api/auth`)
* `POST /login` — Logs in user, returns `accessToken` and `refreshToken`.
* `POST /register` *(Admin/FleetManager only)* — Registers a new user.
* `POST /token` — Exchanges a refresh token for a new access token.
* `POST /logout` — Invalidates the user's active session token.
* `GET /me` — Retrieves current user profile.

### 🚛 Vehicles (`/api/vehicles`)
* `GET /` — Fetch all vehicles (supports query filters by `status`, `type`, `region`).
* `POST /` *(Admin/FleetManager only)* — Register a new vehicle.
* `GET /:id` — Fetch vehicle details.
* `PUT /:id` *(Admin/FleetManager only)* — Update vehicle.
* `DELETE /:id` *(Admin/FleetManager only)* — Delete vehicle.

### 🪪 Drivers (`/api/drivers`)
* `GET /` — Fetch all drivers (supports query filters by `status`, `region`).
* `POST /` *(Admin/FleetManager/SafetyOfficer only)* — Create driver profile.
* `GET /:id` — Fetch driver details.
* `PUT /:id` *(Admin/FleetManager/SafetyOfficer only)* — Update driver.
* `DELETE /:id` *(Admin/FleetManager only)* — Delete driver (SafetyOfficer blocked).

### 🗺️ Trips (`/api/trips`)
* `POST /` *(Admin/FleetManager/Driver only)* — Create a trip in `Draft` state.
* `GET /` — Fetch all trips.
* `PUT /:id/dispatch` *(Admin/FleetManager/Driver only)* — Dispatches trip. Runs business validations. Updates statuses to `On Trip`.
* `PUT /:id/complete` *(Admin/FleetManager/Driver only)* — Completes trip. Requires `actualDistance`, `fuelConsumed`, `revenue`, `fuelCost`. Updates vehicle odometer, auto-logs fuel, sets statuses back to `Available`.
* `PUT /:id/cancel` *(Admin/FleetManager/Driver only)* — Cancels trip. Restores vehicle/driver to `Available`.

### 🔧 Maintenance (`/api/maintenance`)
* `GET /` — Retrieve all maintenance records.
* `POST /` *(Admin/FleetManager/SafetyOfficer only)* — Logs maintenance log, moves vehicle to `In Shop`.
* `PUT /:id/close` *(Admin/FleetManager/SafetyOfficer only)* — Closes maintenance log, restores vehicle to `Available` (unless Retired).

### 🪙 Finance (`/api/finance`)
* `POST /fuel` *(Admin/FleetManager/Driver/FinancialAnalyst)* — Logs fuel purchase.
* `POST /expense` *(Admin/FleetManager/FinancialAnalyst)* — Logs tolls or other costs.
* `GET /operational-costs` *(Admin/FleetManager/FinancialAnalyst)* — Database aggregate reporting total operational costs (Fuel + Maintenance) per vehicle.

### 📈 Reports & Analytics (`/api/reports`)
* `GET /dashboard` — High level dashboard KPIs (Fleet Utilization %, Active Trips, Vehicles In Shop, etc.). Supports type/status/region query parameters.
* `GET /vehicle-roi` *(Admin/FleetManager/FinancialAnalyst)* — Aggregated ROI calculation `(Revenue - (Fuel + Maintenance)) / Acquisition Cost` and Fuel Efficiency `(Distance / Liters)` computed natively in MongoDB.
* `GET /export-csv` *(Admin/FleetManager/FinancialAnalyst)* — Streams report rows directly as a CSV file.

---

## 🔍 Verification Tests
A complete programmatic validation suite is included to check all business operations sequentially.
To run the verification suite:
```bash
node verify_api.js
```
The test suite spins up an isolated testing server, populates it, registers and dispatches trips, checks validation guards, performs database teardown, and cleanly prints the results.
