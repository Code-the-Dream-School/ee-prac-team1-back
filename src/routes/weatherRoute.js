const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');

router.route('/:id').get(getWeather);

module.exports = router;
