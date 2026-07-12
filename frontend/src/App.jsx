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
  const { user, loading } = useAppState();

  // Wait for token validation before rendering routes
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Starting TransitOps...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
