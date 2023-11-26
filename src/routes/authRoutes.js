const express = require('express');
const router = express.Router();

const { login, register, logout,verifyCode } = require('../controllers/authController');

router.post('/verifyCode/:verificationCode', verifyCode);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
