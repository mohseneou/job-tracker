const express = require('express');

const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./user');
const companyRoutes = require('./company');

// Use route modules
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/company', companyRoutes);

module.exports = router;