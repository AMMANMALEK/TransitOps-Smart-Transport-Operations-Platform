const express = require('express');
const router = express.Router();
const financeController = require('./finance.controller');
const { authenticateJWT, checkRole } = require('../../middleware/auth');

// Fuel logging (accessible by Admin, FleetManager, Driver, and FinancialAnalyst)
router.post('/fuel', authenticateJWT, checkRole('Admin', 'FleetManager', 'Driver', 'FinancialAnalyst'), financeController.logFuel);
router.get('/fuel', authenticateJWT, checkRole('Admin', 'FleetManager', 'Driver', 'FinancialAnalyst'), financeController.getFuelLogs);

// Expense logging (accessible by Admin, FleetManager, and FinancialAnalyst)
router.post('/expense', authenticateJWT, checkRole('Admin', 'FleetManager', 'FinancialAnalyst'), financeController.logExpense);
router.get('/expense', authenticateJWT, checkRole('Admin', 'FleetManager', 'FinancialAnalyst'), financeController.getExpenses);

// Get operational costs report (accessible by Admin, FleetManager, and FinancialAnalyst)
router.get('/operational-costs', authenticateJWT, checkRole('Admin', 'FleetManager', 'FinancialAnalyst'), financeController.getOperationalCosts);

module.exports = router;
