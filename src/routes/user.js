const express = require('express');

const auth = require('../middlewares/auth');

const infoController = require('../controllers/user/info');

const router = express.Router();

router.get('/info', auth, infoController);

module.exports = router;