const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const { authenticateJWT } = require('../../middleware/auth');

// Dashboard KPIs — any authenticated user
router.get('/dashboard', authenticateJWT, reportsController.getDashboardKPIs);

// Vehicle ROI Report — any authenticated user
router.get('/vehicle-roi', authenticateJWT, reportsController.getVehicleROIReport);

// Export CSV Report — any authenticated user
router.get('/export-csv', authenticateJWT, reportsController.exportCSVReport);

module.exports = router;
