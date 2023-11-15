const express = require('express');
const router = express.Router();

const { login, register, logout, editUserProfile, deleteUserAccount } = require('../controllers/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.delete('/:userId', deleteUserAccount);
router.patch('/:userId', editUserProfile);

module.exports = router;
