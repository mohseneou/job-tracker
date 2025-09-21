const express = require('express');

const auth = require('../middlewares/auth');

const signupValidator = require('../validators/auth/signup');
const signupController = require('../controllers/auth/signup');

const verifyEmailController = require('../controllers/auth/verifyEmail');

const loginController = require('../controllers/auth/login');
const loginValidator = require('../validators/auth/login');

const tokenController = require('../controllers/auth/token');

const router = express.Router();

router.post('/signup', signupValidator, signupController);
router.get('/verify-email/:token', verifyEmailController);
router.post('/login', loginValidator, loginController);
router.post('/token', auth.refreshToken, tokenController);

module.exports = router;