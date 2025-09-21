const express = require('express');

const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./user');

// Use route modules
router.use('/auth', authRoutes);
router.use('/user', userRoutes);

module.exports = router;