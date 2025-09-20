const express = require('express');

const auth = require('../middlewares/auth');

const infoController = require('../controllers/user/info');

const updateProfileValidator = require('../validators/user/updateProfile');
const updateProfileController = require('../controllers/user/updateProfile');

const router = express.Router();

router.get('/info', auth, infoController);
router.patch('/update-profile', auth, updateProfileValidator, updateProfileController);

module.exports = router;