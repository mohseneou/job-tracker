const express = require('express');

const signupValidator = require('../validators/auth/signup');
const signupController = require('../controllers/auth/signup');

const verifyEmailController = require('../controllers/auth/verifyEmail');

const loginController = require('../controllers/auth/login');
const loginValidator = require('../validators/auth/login');

const router = express.Router();

router.post('/signup', signupValidator, signupController);
router.get('/verify-email/:token', verifyEmailController);
router.post('/login', loginValidator, loginController);

module.exports = router;