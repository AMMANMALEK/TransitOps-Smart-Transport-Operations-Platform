import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StateProvider, useAppState } from './context/StateContext';
import { ROLE_HOME, hasRouteAccess } from './config/permissions';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import DriverManagement from './pages/DriverManagement';
import TripManagement from './pages/TripManagement';
import MaintenanceManagement from './pages/MaintenanceManagement';
import FuelExpenseManagement from './pages/FuelExpenseManagement';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const homeFor = role => ROLE_HOME[role] || '/dashboard';

const RoleRoute = ({ children, routePath }) => {
  const { user } = useAppState();
  if (!user) return <Navigate to="/login" replace />;
  if (!hasRouteAccess(user.role, routePath)) return <Navigate to={homeFor(user.role)} replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAppState();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Role-restricted pages */}
      <Route path="/dashboard" element={<RoleRoute routePath="/dashboard"><Dashboard /></RoleRoute>} />
      <Route path="/vehicles" element={<RoleRoute routePath="/vehicles"><VehicleRegistry /></RoleRoute>} />
      <Route path="/drivers" element={<RoleRoute routePath="/drivers"><DriverManagement /></RoleRoute>} />
      <Route path="/trips" element={<RoleRoute routePath="/trips"><TripManagement /></RoleRoute>} />
      <Route path="/maintenance" element={<RoleRoute routePath="/maintenance"><MaintenanceManagement /></RoleRoute>} />
      <Route path="/expenses" element={<RoleRoute routePath="/expenses"><FuelExpenseManagement /></RoleRoute>} />
      <Route path="/analytics" element={<RoleRoute routePath="/analytics"><AnalyticsDashboard /></RoleRoute>} />

      <Route path="*" element={user ? <Navigate to={homeFor(user.role)} replace /> : <Navigate to="/login" replace />} />
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
