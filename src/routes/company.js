const express = require('express');

const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

const requestAccountController = require('../controllers/company/requestAccount');
const requestAccountValidators = require('../validators/company/requestAccount');

const rejectAccountController = require('../controllers/company/rejectAccount');
const rejectAccountValidator = require('../validators/company/rejectAccount');

const router = express.Router();

router.post('/request-account', auth.accessToken, requestAccountValidators, requestAccountController);
router.post('/reject-account', auth.accessToken, role.admin, rejectAccountValidator, rejectAccountController);

module.exports = router;