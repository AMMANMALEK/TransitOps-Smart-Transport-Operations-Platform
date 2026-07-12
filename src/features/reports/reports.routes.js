const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const { authenticateJWT, checkRole } = require('../../middleware/auth');

// Dashboard KPIs (Accessible by all authenticated roles)
router.get('/dashboard', authenticateJWT, reportsController.getDashboardKPIs);

// Vehicle ROI Report (Accessible by Admin, FleetManager, and FinancialAnalyst)
router.get('/vehicle-roi', authenticateJWT, checkRole('Admin', 'FleetManager', 'FinancialAnalyst'), reportsController.getVehicleROIReport);

// Export CSV Report (Accessible by Admin, FleetManager, and FinancialAnalyst)
router.get('/export-csv', authenticateJWT, checkRole('Admin', 'FleetManager', 'FinancialAnalyst'), reportsController.exportCSVReport);

module.exports = router;
