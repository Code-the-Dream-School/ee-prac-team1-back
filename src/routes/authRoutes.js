const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authentication');


const { register, finishRegistration, login, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/finishRegistration', authenticateUser, finishRegistration);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
