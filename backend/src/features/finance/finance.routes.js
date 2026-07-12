const express = require('express');
const router = express.Router();
const financeController = require('./finance.controller');
const { authenticateJWT, checkRole } = require('../../middleware/auth');

// Fuel logging — any authenticated user can read; write open to all roles
router.post('/fuel', authenticateJWT, financeController.logFuel);
router.get('/fuel', authenticateJWT, financeController.getFuelLogs);

// Expense logging — any authenticated user can read; write open to all roles
router.post('/expense', authenticateJWT, financeController.logExpense);
router.get('/expense', authenticateJWT, financeController.getExpenses);

// Operational costs report — any authenticated user
router.get('/operational-costs', authenticateJWT, financeController.getOperationalCosts);

module.exports = router;
