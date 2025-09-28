const express = require('express');

const auth = require('../middlewares/auth');
const verified = require('../middlewares/verified');
const role = require('../middlewares/role');

const requestAccountController = require('../controllers/company/requestAccount');
const requestAccountValidators = require('../validators/company/requestAccount');

const reSubmitRequestAccountController = require('../controllers/company/reSubmitRequestAccount');
const reSubmitRequestAccountValidator = require('../validators/company/reSubmitRequestAccount');

const rejectAccountController = require('../controllers/company/rejectAccount');
const rejectAccountValidator = require('../validators/company/rejectAccount');

const acceptAccountController = require('../controllers/company/acceptAccount');
const acceptAccountValidator = require('../validators/company/acceptAccount');

const listController = require('../controllers/company/list');
const listValidator = require('../validators/company/list');

const getOneController = require('../controllers/company/getOne');
const getOneValidator = require('../validators/company/getOne');

const router = express.Router();

router.post('/request-account', auth.accessToken, verified, requestAccountValidators, requestAccountController);
router.post('/reject-account', auth.accessToken, role.admin, rejectAccountValidator, rejectAccountController);
router.post('/accept-account', auth.accessToken, role.admin, acceptAccountValidator, acceptAccountController);
router.patch('/request-account/re-submit', auth.accessToken, verified, reSubmitRequestAccountValidator, reSubmitRequestAccountController);

router.get('/list', auth.accessToken, role.admin, listValidator, listController);
router.get('/:id', auth.accessToken, role.admin, getOneValidator, getOneController);

module.exports = router;