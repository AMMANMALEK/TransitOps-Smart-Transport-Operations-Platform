const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticateJWT, checkRole } = require('../../middleware/auth');

// Public auth routes
router.post('/login', authController.login);
router.post('/token', authController.token);
router.post('/logout', authController.logout);

// Protected routes
router.post('/register', authenticateJWT, checkRole('Admin', 'FleetManager'), authController.register);
router.get('/me', authenticateJWT, authController.me);

module.exports = router;
