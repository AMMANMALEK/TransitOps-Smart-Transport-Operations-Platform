import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StateProvider, useAppState } from './context/StateContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import DriverManagement from './pages/DriverManagement';
import TripManagement from './pages/TripManagement';
import MaintenanceManagement from './pages/MaintenanceManagement';
import FuelExpenseManagement from './pages/FuelExpenseManagement';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const APP_ROLES = ['admin', 'officer', 'manager', 'vendor'];

const RoleRoute = ({ children, allowedRoles = APP_ROLES }) => {
  const { user } = useAppState();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAppState();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<RoleRoute><Dashboard /></RoleRoute>} />
      <Route path="/vehicles" element={<RoleRoute><VehicleRegistry /></RoleRoute>} />
      <Route path="/drivers" element={<RoleRoute><DriverManagement /></RoleRoute>} />
      <Route path="/trips" element={<RoleRoute><TripManagement /></RoleRoute>} />
      <Route path="/maintenance" element={<RoleRoute><MaintenanceManagement /></RoleRoute>} />
      <Route path="/expenses" element={<RoleRoute><FuelExpenseManagement /></RoleRoute>} />
      <Route path="/analytics" element={<RoleRoute><AnalyticsDashboard /></RoleRoute>} />

      <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <StateProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StateProvider>
  );
}

export default App;
