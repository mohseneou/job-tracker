const express = require('express');

const auth = require('../middlewares/auth');

const requestAccountController = require('../controllers/company/requestAccount');
const requestAccountValidators = require('../validators/company/requestAccount');

const router = express.Router();

router.post('/request-account', auth.accessToken, requestAccountValidators, requestAccountController);

module.exports = router;