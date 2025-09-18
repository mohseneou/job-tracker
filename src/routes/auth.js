const express = require('express');

const signupValidator = require('../validators/auth/signup');
const signupController = require('../controllers/auth/signup');

const router = express.Router();

router.post('/signup', signupValidator, signupController);

module.exports = router;