const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authentication');

const {
	register,
	finishRegistration,
	login,
	logout,
	verifyCode,
	forgotPassword,
	resetPassword,
} = require('../controllers/authController');

router.post('/resetPassword/:resetCode', resetPassword);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyCode/:verificationCode', verifyCode);
router.post('/register', register);
router.post('/finishRegistration', authenticateUser, finishRegistration);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
