const express = require('express');

const auth = require('../middlewares/auth');
const verified = require('../middlewares/verified');
const role = require('../middlewares/role');

const requestAccountController = require('../controllers/company/requestAccount');
const requestAccountValidators = require('../validators/company/requestAccount');

const rejectAccountController = require('../controllers/company/rejectAccount');
const rejectAccountValidator = require('../validators/company/rejectAccount');

const acceptAccountController = require('../controllers/company/acceptAccount');
const acceptAccountValidator = require('../validators/company/acceptAccount');

const router = express.Router();

router.post('/request-account', auth.accessToken, verified, requestAccountValidators, requestAccountController);
router.post('/reject-account', auth.accessToken, role.admin, rejectAccountValidator, rejectAccountController);
router.post('/accept-account', auth.accessToken, role.admin, acceptAccountValidator, acceptAccountController);

module.exports = router;