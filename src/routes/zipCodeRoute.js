const express = require('express');
const router = express.Router();
const { getActivitiesByZipCode } = require('../controllers/zipCodeController');

router.get('/search/:zipCode', getActivitiesByZipCode);


module.exports = router;
